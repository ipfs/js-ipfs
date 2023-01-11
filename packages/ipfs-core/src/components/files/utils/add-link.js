import * as dagPB from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { logger } from '@libp2p/logger'
import { UnixFS } from 'ipfs-unixfs'
import { DirSharded } from './dir-sharded.js'
import {
  updateHamtDirectory,
  recreateHamtLevel,
  recreateInitialHamtLevel,
  createShard,
  toPrefix,
  addLinksToHamtBucket
} from './hamt-utils.js'
import errCode from 'err-code'
import last from 'it-last'

const log = logger('ipfs:mfs:core:utils:add-link')

/**
 * @typedef {import('ipfs-unixfs').Mtime} Mtime
 * @typedef {import('multiformats/cid').Version} CIDVersion
 * @typedef {import('hamt-sharding').Bucket<any>} Bucket
 * @typedef {import('../').MfsContext} MfsContext
 * @typedef {import('@ipld/dag-pb').PBNode} PBNode
 * @typedef {import('@ipld/dag-pb').PBLink} PBLink
 */

/**
 * @param {MfsContext} context
 * @param {object} options
 * @param {CID} options.cid
 * @param {string} options.name
 * @param {number} options.size
 * @param {number} options.shardSplitThreshold
 * @param {string} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {CID} [options.parentCid]
 * @param {PBNode} [options.parent]
 */
export async function addLink (context, options) {
  let parent = options.parent

  if (options.parentCid) {
    const parentCid = CID.asCID(options.parentCid)
    if (parentCid === null) {
      throw errCode(new Error('Invalid CID passed to addLink'), 'EINVALIDPARENTCID')
    }

    if (parentCid.code !== dagPB.code) {
      throw errCode(new Error('Unsupported codec. Only DAG-PB is supported'), 'EINVALIDPARENTCID')
    }

    log(`Loading parent node ${parentCid}`)
    const block = await context.repo.blocks.get(parentCid)
    parent = dagPB.decode(block)
  }

  if (!parent) {
    throw errCode(new Error('No parent node or CID passed to addLink'), 'EINVALIDPARENT')
  }

  if (!options.cid) {
    throw errCode(new Error('No child cid passed to addLink'), 'EINVALIDCHILDCID')
  }

  if (!options.name) {
    throw errCode(new Error('No child name passed to addLink'), 'EINVALIDCHILDNAME')
  }

  if (!options.size && options.size !== 0) {
    throw errCode(new Error('No child size passed to addLink'), 'EINVALIDCHILDSIZE')
  }

  if (!parent.Data) {
    throw errCode(new Error('Parent node with no data passed to addLink'), 'ERR_INVALID_PARENT')
  }

  const meta = UnixFS.unmarshal(parent.Data)

  if (meta.type === 'hamt-sharded-directory') {
    log('Adding link to sharded directory')

    return addToShardedDirectory(context, {
      ...options,
      parent
    })
  }

  if (parent.Links.length >= options.shardSplitThreshold) {
    log('Converting directory to sharded directory')

    return convertToShardedDirectory(context, {
      ...options,
      parent,
      mtime: meta.mtime,
      mode: meta.mode
    })
  }

  log(`Adding ${options.name} (${options.cid}) to regular directory`)

  return addToDirectory(context, {
    ...options,
    parent
  })
}

/**
 * @param {MfsContext} context
 * @param {object} options
 * @param {CID} options.cid
 * @param {string} options.name
 * @param {number} options.size
 * @param {PBNode} options.parent
 * @param {string} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {Mtime} [options.mtime]
 * @param {number} [options.mode]
 */
const convertToShardedDirectory = async (context, options) => {
  const result = await createShard(context, options.parent.Links.map(link => ({
    name: (link.Name || ''),
    size: link.Tsize || 0,
    cid: link.Hash
  })).concat({
    name: options.name,
    size: options.size,
    cid: options.cid
  }), options)

  log(`Converted directory to sharded directory ${result.cid}`)

  return result
}

/**
 * @param {MfsContext} context
 * @param {object} options
 * @param {CID} options.cid
 * @param {string} options.name
 * @param {number} options.size
 * @param {PBNode} options.parent
 * @param {string} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {Mtime} [options.mtime]
 * @param {number} [options.mode]
 */
const addToDirectory = async (context, options) => {
  // Remove existing link if it exists
  const parentLinks = options.parent.Links.filter((link) => {
    return link.Name !== options.name
  })
  parentLinks.push({
    Name: options.name,
    Tsize: options.size,
    Hash: options.cid
  })

  if (!options.parent.Data) {
    throw errCode(new Error('Parent node with no data passed to addToDirectory'), 'ERR_INVALID_PARENT')
  }

  const node = UnixFS.unmarshal(options.parent.Data)

  let data
  if (node.mtime) {
    // Update mtime if previously set
    const ms = Date.now()
    const secs = Math.floor(ms / 1000)

    node.mtime = {
      secs: secs,
      nsecs: (ms - (secs * 1000)) * 1000
    }

    data = node.marshal()
  } else {
    data = options.parent.Data
  }
  options.parent = dagPB.prepare({
    Data: data,
    Links: parentLinks
  })

  // Persist the new parent PbNode
  const hasher = await context.hashers.getHasher(options.hashAlg)
  const buf = dagPB.encode(options.parent)
  const hash = await hasher.digest(buf)
  const cid = CID.create(options.cidVersion, dagPB.code, hash)

  if (options.flush) {
    await context.repo.blocks.put(cid, buf)
  }

  return {
    node: options.parent,
    cid,
    size: buf.length
  }
}

/**
 * @param {MfsContext} context
 * @param {object} options
 * @param {CID} options.cid
 * @param {string} options.name
 * @param {number} options.size
 * @param {PBNode} options.parent
 * @param {string} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 */
const addToShardedDirectory = async (context, options) => {
  const {
    shard, path
  } = await addFileToShardedDirectory(context, options)
  const result = await last(shard.flush(context.repo.blocks))

  if (!result) {
    throw new Error('No result from flushing shard')
  }

  const block = await context.repo.blocks.get(result.cid)
  const node = dagPB.decode(block)

  // we have written out the shard, but only one sub-shard will have been written so replace it in the original shard
  const parentLinks = options.parent.Links.filter((link) => {
    // TODO vmx 2021-03-31: Check that there cannot be multiple ones matching
    // Remove the old link
    return (link.Name || '').substring(0, 2) !== path[0].prefix
  })

  const newLink = node.Links
    .find(link => (link.Name || '').substring(0, 2) === path[0].prefix)

  if (!newLink) {
    throw new Error(`No link found with prefix ${path[0].prefix}`)
  }

  parentLinks.push(newLink)

  return updateHamtDirectory(context, parentLinks, path[0].bucket, options)
}

/**
 * @param {MfsContext} context
 * @param {object} options
 * @param {CID} options.cid
 * @param {string} options.name
 * @param {number} options.size
 * @param {PBNode} options.parent
 * @param {string} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 */
const addFileToShardedDirectory = async (context, options) => {
  const file = {
    name: options.name,
    cid: options.cid,
    size: options.size
  }

  if (!options.parent.Data) {
    throw errCode(new Error('Parent node with no data passed to addFileToShardedDirectory'), 'ERR_INVALID_PARENT')
  }

  // start at the root bucket and descend, loading nodes as we go
  const rootBucket = await recreateInitialHamtLevel(options.parent.Links)
  const node = UnixFS.unmarshal(options.parent.Data)

  const shard = new DirSharded({
    root: true,
    dir: true,
    parent: undefined,
    parentKey: undefined,
    path: '',
    dirty: true,
    flat: false,
    mode: node.mode
  }, options)
  shard._bucket = rootBucket

  if (node.mtime) {
    // update mtime if previously set
    shard.mtime = {
      secs: Math.round(Date.now() / 1000)
    }
  }

  // load subshards until the bucket & position no longer changes
  const position = await rootBucket._findNewBucketAndPos(file.name)
  const path = toBucketPath(position)
  path[0].node = options.parent
  let index = 0

  while (index < path.length) {
    const segment = path[index]
    index++
    const node = segment.node

    if (!node) {
      throw new Error('Segment had no node')
    }

    const link = node.Links
      .find(link => (link.Name || '').substring(0, 2) === segment.prefix)

    if (!link) {
      // prefix is new, file will be added to the current bucket
      log(`Link ${segment.prefix}${file.name} will be added`)
      index = path.length

      break
    }

    if (link.Name === `${segment.prefix}${file.name}`) {
      // file already existed, file will be added to the current bucket
      log(`Link ${segment.prefix}${file.name} will be replaced`)
      index = path.length

      break
    }

    if ((link.Name || '').length > 2) {
      // another file had the same prefix, will be replaced with a subshard
      log(`Link ${link.Name} ${link.Hash} will be replaced with a subshard`)
      index = path.length

      break
    }

    // load sub-shard
    log(`Found subshard ${segment.prefix}`)
    const block = await context.repo.blocks.get(link.Hash)
    const subShard = dagPB.decode(block)

    // subshard hasn't been loaded, descend to the next level of the HAMT
    if (!path[index]) {
      log(`Loaded new subshard ${segment.prefix}`)
      await recreateHamtLevel(context, subShard.Links, rootBucket, segment.bucket, parseInt(segment.prefix, 16))

      const position = await rootBucket._findNewBucketAndPos(file.name)

      path.push({
        bucket: position.bucket,
        prefix: toPrefix(position.pos),
        node: subShard
      })

      break
    }

    const nextSegment = path[index]

    // add next levels worth of links to bucket
    await addLinksToHamtBucket(context, subShard.Links, nextSegment.bucket, rootBucket)

    nextSegment.node = subShard
  }

  // finally add the new file into the shard
  await shard._bucket.put(file.name, {
    size: file.size,
    cid: file.cid
  })

  return {
    shard, path
  }
}

/**
 * @param {{ pos: number, bucket: Bucket }} position
 * @returns {{ bucket: Bucket, prefix: string, node?: PBNode }[]}
 */
const toBucketPath = (position) => {
  const path = [{
    bucket: position.bucket,
    prefix: toPrefix(position.pos)
  }]

  let bucket = position.bucket._parent
  let positionInBucket = position.bucket._posAtParent

  while (bucket) {
    path.push({
      bucket,
      prefix: toPrefix(positionInBucket)
    })

    positionInBucket = bucket._posAtParent
    bucket = bucket._parent
  }

  path.reverse()

  return path
}
