'use strict'

const {
  DAGNode
} = require('ipld-dag-pb')
const {
  Bucket,
  createHAMT
} = require('hamt-sharding')
// @ts-ignore - refactor this to not need deep require
const DirSharded = require('ipfs-unixfs-importer/src/dir-sharded')
// @ts-ignore - refactor this to not need deep require
const defaultImporterOptions = require('ipfs-unixfs-importer/src/options')
const log = require('debug')('ipfs:mfs:core:utils:hamt-utils')
const { UnixFS } = require('ipfs-unixfs')
const mc = require('multicodec')
const mh = require('multihashing-async').multihash
const last = require('it-last')

/**
 * @typedef {import('ipld-dag-pb').DAGLink} DAGLink
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('ipfs-unixfs').Mtime} Mtime
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('cids')} CID
 * @typedef {import('../').MfsContext} MfsContext
 */

/**
 * @param {MfsContext} context
 * @param {DAGLink[]} links
 * @param {Bucket<any>} bucket
 * @param {object} options
 * @param {DAGNode} options.parent
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {HashName} options.hashAlg
 */
const updateHamtDirectory = async (context, links, bucket, options) => {
  const importerOptions = defaultImporterOptions()

  // update parent with new bit field
  const data = Uint8Array.from(bucket._children.bitField().reverse())
  const node = UnixFS.unmarshal(options.parent.Data)
  const dir = new UnixFS({
    type: 'hamt-sharded-directory',
    data,
    fanout: bucket.tableSize(),
    hashType: importerOptions.hamtHashCode,
    mode: node.mode,
    mtime: node.mtime
  })

  const hashAlg = mh.names[options.hashAlg]
  const parent = new DAGNode(dir.marshal(), links)
  const cid = await context.ipld.put(parent, mc.DAG_PB, {
    cidVersion: options.cidVersion,
    hashAlg,
    onlyHash: !options.flush
  })

  return {
    node: parent,
    cid,
    size: parent.size
  }
}

/**
 * @param {DAGLink[]} links
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
 * @param {DAGLink[]} links
 */
const recreateInitialHamtLevel = async (links) => {
  const importerOptions = defaultImporterOptions()
  const bucket = createHAMT({
    hashFn: importerOptions.hamtHashFn,
    bits: importerOptions.hamtBucketBits
  })

  await addLinksToHamtBucket(links, bucket, bucket)

  return bucket
}

/**
 * @param {DAGLink[]} links
 * @param {Bucket<any>} bucket
 * @param {Bucket<any>} rootBucket
 */
const addLinksToHamtBucket = async (links, bucket, rootBucket) => {
  await Promise.all(
    links.map(link => {
      if (link.Name.length === 2) {
        const pos = parseInt(link.Name, 16)

        bucket._putObjectAt(pos, new Bucket({
          hash: rootBucket._options.hash,
          bits: rootBucket._options.bits
        }, bucket, pos))

        return Promise.resolve()
      }

      return rootBucket.put(link.Name.substring(2), {
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
 * @param {DAGNode} rootNode
 */
const generatePath = async (context, fileName, rootNode) => {
  // start at the root bucket and descend, loading nodes as we go
  const rootBucket = await recreateInitialHamtLevel(rootNode.Links)
  const position = await rootBucket._findNewBucketAndPos(fileName)

  // the path to the root bucket
  /** @type {{ bucket: Bucket<any>, prefix: string, node?: DAGNode }[]} */
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

  // load DAGNode for each path segment
  for (let i = 0; i < path.length; i++) {
    const segment = path[i]

    if (!segment.node) {
      throw new Error('Could not generate HAMT path')
    }

    // find prefix in links
    const link = segment.node.Links
      .filter(link => link.Name.substring(0, 2) === segment.prefix)
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
    const node = await context.ipld.get(link.Hash)

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
  const importerOptions = defaultImporterOptions()

  const shard = new DirSharded({
    root: true,
    dir: true,
    parent: null,
    parentKey: null,
    path: '',
    dirty: true,
    flat: false,
    mtime: options.mtime,
    mode: options.mode
  }, {
    hamtHashFn: importerOptions.hamtHashFn,
    hamtHashCode: importerOptions.hamtHashCode,
    hamtBucketBits: importerOptions.hamtBucketBits,
    ...options,
    codec: 'dag-pb'
  })

  for (let i = 0; i < contents.length; i++) {
    await shard._bucket.put(contents[i].name, {
      size: contents[i].size,
      cid: contents[i].cid
    })
  }

  return last(shard.flush(context.block))
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
