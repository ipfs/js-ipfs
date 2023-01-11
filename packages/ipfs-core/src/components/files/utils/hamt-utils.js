import * as dagPB from '@ipld/dag-pb'
import {
  Bucket,
  createHAMT
} from 'hamt-sharding'
import { DirSharded } from './dir-sharded.js'
import { logger } from '@libp2p/logger'
import { UnixFS } from 'ipfs-unixfs'
import last from 'it-last'
import { CID } from 'multiformats/cid'
import {
  hamtHashCode,
  hamtHashFn,
  hamtBucketBits
} from './hamt-constants.js'

const log = logger('ipfs:mfs:core:utils:hamt-utils')

/**
 * @typedef {import('multiformats/cid').Version} CIDVersion
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
export const updateHamtDirectory = async (context, links, bucket, options) => {
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
  const buf = dagPB.encode(parent)
  const hash = await hasher.digest(buf)
  const cid = CID.create(options.cidVersion, dagPB.code, hash)

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
 * @param {MfsContext} context
 * @param {PBLink[]} links
 * @param {Bucket<any>} rootBucket
 * @param {Bucket<any>} parentBucket
 * @param {number} positionAtParent
 */
export const recreateHamtLevel = async (context, links, rootBucket, parentBucket, positionAtParent) => {
  // recreate this level of the HAMT
  const bucket = new Bucket({
    hash: rootBucket._options.hash,
    bits: rootBucket._options.bits
  }, parentBucket, positionAtParent)
  parentBucket._putObjectAt(positionAtParent, bucket)

  await addLinksToHamtBucket(context, links, bucket, rootBucket)

  return bucket
}

/**
 * @param {PBLink[]} links
 */
export const recreateInitialHamtLevel = async (links) => {
  const bucket = createHAMT({
    hashFn: hamtHashFn,
    bits: hamtBucketBits
  })

  // populate sub bucket but do not recurse as we do not want to pull whole shard in
  await Promise.all(
    links.map(async link => {
      const linkName = (link.Name || '')

      if (linkName.length === 2) {
        const pos = parseInt(linkName, 16)

        const subBucket = new Bucket({
          hash: bucket._options.hash,
          bits: bucket._options.bits
        }, bucket, pos)
        bucket._putObjectAt(pos, subBucket)

        return Promise.resolve()
      }

      return bucket.put(linkName.substring(2), {
        size: link.Tsize,
        cid: link.Hash
      })
    })
  )

  return bucket
}

/**
 * @param {MfsContext} context
 * @param {PBLink[]} links
 * @param {Bucket<any>} bucket
 * @param {Bucket<any>} rootBucket
 */
export const addLinksToHamtBucket = async (context, links, bucket, rootBucket) => {
  await Promise.all(
    links.map(async link => {
      const linkName = (link.Name || '')

      if (linkName.length === 2) {
        log('Populating sub bucket', linkName)
        const pos = parseInt(linkName, 16)
        const block = await context.repo.blocks.get(link.Hash)
        const node = dagPB.decode(block)

        const subBucket = new Bucket({
          hash: rootBucket._options.hash,
          bits: rootBucket._options.bits
        }, bucket, pos)
        bucket._putObjectAt(pos, subBucket)

        await addLinksToHamtBucket(context, node.Links, subBucket, rootBucket)

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
export const toPrefix = (position) => {
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
export const generatePath = async (context, fileName, rootNode) => {
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

    // @ts-expect-error - only the root bucket's parent will be undefined
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
    const node = dagPB.decode(block)

    // subshard hasn't been loaded, descend to the next level of the HAMT
    if (!path[i + 1]) {
      log(`Loaded new subshard ${segment.prefix}`)

      await recreateHamtLevel(context, node.Links, rootBucket, segment.bucket, parseInt(segment.prefix, 16))
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
    await addLinksToHamtBucket(context, node.Links, nextSegment.bucket, rootBucket)

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
export const createShard = async (context, contents, options = {}) => {
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
