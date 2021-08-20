'use strict'

const dagPb = require('@ipld/dag-pb')
const {
  Bucket,
  createHAMT
} = require('hamt-sharding')
const DirSharded = require('./dir-sharded')
const log = require('debug')('ipfs:mfs:core:utils:hamt-utils')
const { UnixFS } = require('ipfs-unixfs')
const last = require('it-last')
const { CID } = require('multiformats/cid')
const {
  hamtHashCode,
  hamtHashFn,
  hamtBucketBits
} = require('./hamt-constants')

/**
 * @typedef {import('multiformats/cid').CIDVersion} CIDVersion
 * @typedef {import('ipfs-unixfs').Mtime} Mtime
 * @typedef {import('../').MfsContext} MfsContext
 * @typedef {import('@ipld/dag-pb').PBNode} PBNode
 * @typedef {import('@ipld/dag-pb').PBLink} PBLink
 */

/**
 * @param {MfsContext} context
 * @param {PBLink[]} links
 * @param {Bucket<any>} bucket
 * @param {object} options
 * @param {PBNode} options.parent
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {string} options.hashAlg
 */
const updateHamtDirectory = async (context, links, bucket, options) => {
  if (!options.parent.Data) {
    throw new Error('Could not update HAMT directory because parent had no data')
  }

  // update parent with new bit field
  const data = Uint8Array.from(bucket._children.bitField().reverse())
  const node = UnixFS.unmarshal(options.parent.Data)
  const dir = new UnixFS({
    type: 'hamt-sharded-directory',
    data,
    fanout: bucket.tableSize(),
    hashType: hamtHashCode,
    mode: node.mode,
    mtime: node.mtime
  })

  const hasher = await context.hashers.getHasher(options.hashAlg)
  const parent = {
    Data: dir.marshal(),
    Links: links.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''))
  }
  const buf = dagPb.encode(parent)
  const hash = await hasher.digest(buf)
  const cid = CID.create(options.cidVersion, dagPb.code, hash)

  if (options.flush) {
    await context.repo.blocks.put(cid, buf)
  }

  return {
    node: parent,
    cid,
    size: links.reduce((sum, link) => sum + (link.Tsize || 0), buf.length)
  }
}

/**
 * @param {PBLink[]} links
 * @param {Bucket<any>} rootBucket
 * @param {Bucket<any>} parentBucket
 * @param {number} positionAtParent
 */
const recreateHamtLevel = async (links, rootBucket, parentBucket, positionAtParent) => {
  // recreate this level of the HAMT
  const bucket = new Bucket({
    hash: rootBucket._options.hash,
    bits: rootBucket._options.bits
  }, parentBucket, positionAtParent)
  parentBucket._putObjectAt(positionAtParent, bucket)

  await addLinksToHamtBucket(links, bucket, rootBucket)

  return bucket
}

/**
 * @param {PBLink[]} links
 */
const recreateInitialHamtLevel = async (links) => {
  const bucket = createHAMT({
    hashFn: hamtHashFn,
    bits: hamtBucketBits
  })

  await addLinksToHamtBucket(links, bucket, bucket)

  return bucket
}

/**
 * @param {PBLink[]} links
 * @param {Bucket<any>} bucket
 * @param {Bucket<any>} rootBucket
 */
const addLinksToHamtBucket = async (links, bucket, rootBucket) => {
  await Promise.all(
    links.map(link => {
      const linkName = (link.Name || '')

      if (linkName.length === 2) {
        const pos = parseInt(linkName, 16)

        bucket._putObjectAt(pos, new Bucket({
          hash: rootBucket._options.hash,
          bits: rootBucket._options.bits
        }, bucket, pos))

        return Promise.resolve()
      }

      return rootBucket.put(linkName.substring(2), {
        size: link.Tsize,
        cid: link.Hash
      })
    })
  )
}

/**
 * @param {number} position
 */
const toPrefix = (position) => {
  return position
    .toString(16)
    .toUpperCase()
    .padStart(2, '0')
    .substring(0, 2)
}

/**
 * @param {MfsContext} context
 * @param {string} fileName
 * @param {PBNode} rootNode
 */
const generatePath = async (context, fileName, rootNode) => {
  // start at the root bucket and descend, loading nodes as we go
  const rootBucket = await recreateInitialHamtLevel(rootNode.Links)
  const position = await rootBucket._findNewBucketAndPos(fileName)

  // the path to the root bucket
  /** @type {{ bucket: Bucket<any>, prefix: string, node?: PBNode }[]} */
  const path = [{
    bucket: position.bucket,
    prefix: toPrefix(position.pos)
  }]
  let currentBucket = position.bucket

  while (currentBucket !== rootBucket) {
    path.push({
      bucket: currentBucket,
      prefix: toPrefix(currentBucket._posAtParent)
    })

    // @ts-ignore - only the root bucket's parent will be undefined
    currentBucket = currentBucket._parent
  }

  path.reverse()
  path[0].node = rootNode

  // load PbNode for each path segment
  for (let i = 0; i < path.length; i++) {
    const segment = path[i]

    if (!segment.node) {
      throw new Error('Could not generate HAMT path')
    }

    // find prefix in links
    const link = segment.node.Links
      .filter(link => (link.Name || '').substring(0, 2) === segment.prefix)
      .pop()

    // entry was not in shard
    if (!link) {
      // reached bottom of tree, file will be added to the current bucket
      log(`Link ${segment.prefix}${fileName} will be added`)
      // return path
      continue
    }

    // found entry
    if (link.Name === `${segment.prefix}${fileName}`) {
      log(`Link ${segment.prefix}${fileName} will be replaced`)
      // file already existed, file will be added to the current bucket
      // return path
      continue
    }

    // found subshard
    log(`Found subshard ${segment.prefix}`)
    const block = await context.repo.blocks.get(link.Hash)
    const node = dagPb.decode(block)

    // subshard hasn't been loaded, descend to the next level of the HAMT
    if (!path[i + 1]) {
      log(`Loaded new subshard ${segment.prefix}`)

      await recreateHamtLevel(node.Links, rootBucket, segment.bucket, parseInt(segment.prefix, 16))
      const position = await rootBucket._findNewBucketAndPos(fileName)

      // i--
      path.push({
        bucket: position.bucket,
        prefix: toPrefix(position.pos),
        node: node
      })

      continue
    }

    const nextSegment = path[i + 1]

    // add intermediate links to bucket
    await addLinksToHamtBucket(node.Links, nextSegment.bucket, rootBucket)

    nextSegment.node = node
  }

  await rootBucket.put(fileName, true)

  path.reverse()

  return {
    rootBucket,
    path
  }
}

/**
 * @param {MfsContext} context
 * @param {{ name: string, size: number, cid: CID }[]} contents
 * @param {object} [options]
 * @param {Mtime} [options.mtime]
 * @param {number} [options.mode]
 */
const createShard = async (context, contents, options = {}) => {
  const shard = new DirSharded({
    root: true,
    dir: true,
    parent: undefined,
    parentKey: undefined,
    path: '',
    dirty: true,
    flat: false,
    mtime: options.mtime,
    mode: options.mode
  }, options)

  for (let i = 0; i < contents.length; i++) {
    await shard._bucket.put(contents[i].name, {
      size: contents[i].size,
      cid: contents[i].cid
    })
  }

  const res = await last(shard.flush(context.repo.blocks))

  if (!res) {
    throw new Error('Flushing shard yielded no result')
  }

  return res
}

module.exports = {
  generatePath,
  updateHamtDirectory,
  recreateHamtLevel,
  recreateInitialHamtLevel,
  addLinksToHamtBucket,
  toPrefix,
  createShard
}
