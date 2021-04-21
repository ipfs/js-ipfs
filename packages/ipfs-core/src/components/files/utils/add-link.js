'use strict'

const {
  DAGLink,
  DAGNode
} = require('ipld-dag-pb')
const CID = require('cids')
const log = require('debug')('ipfs:mfs:core:utils:add-link')
const { UnixFS } = require('ipfs-unixfs')
// @ts-ignore - refactor this to not need deep require
const DirSharded = require('ipfs-unixfs-importer/src/dir-sharded')
// @ts-ignore - refactor this to not need deep require
const defaultImporterOptions = require('ipfs-unixfs-importer/src/options')
const {
  updateHamtDirectory,
  recreateHamtLevel,
  recreateInitialHamtLevel,
  createShard,
  toPrefix,
  addLinksToHamtBucket
} = require('./hamt-utils')
const errCode = require('err-code')
const mc = require('multicodec')
const mh = require('multihashing-async').multihash
const last = require('it-last')

/**
 * @typedef {import('ipfs-unixfs').Mtime} Mtime
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('hamt-sharding').Bucket<any>} Bucket
 * @typedef {import('../').MfsContext} MfsContext
 */

/**
 * @param {MfsContext} context
 * @param {object} options
 * @param {CID} options.cid
 * @param {string} options.name
 * @param {number} options.size
 * @param {number} options.shardSplitThreshold
 * @param {HashName} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {CID} [options.parentCid]
 * @param {DAGNode} [options.parent]
 */
const addLink = async (context, options) => {
  let parent = options.parent

  if (options.parentCid) {
    if (!CID.isCID(options.parentCid)) {
      throw errCode(new Error('Invalid CID passed to addLink'), 'EINVALIDPARENTCID')
    }

    log(`Loading parent node ${options.parentCid}`)
    parent = await context.ipld.get(options.parentCid)
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

  if (!CID.isCID(options.cid)) {
    options.cid = new CID(options.cid)
  }

  if (!options.size && options.size !== 0) {
    throw errCode(new Error('No child size passed to addLink'), 'EINVALIDCHILDSIZE')
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
 * @param {DAGNode} options.parent
 * @param {HashName} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {Mtime} [options.mtime]
 * @param {number} [options.mode]
 */
const convertToShardedDirectory = async (context, options) => {
  const result = await createShard(context, options.parent.Links.map(link => ({
    name: link.Name,
    size: link.Tsize,
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
 * @param {DAGNode} options.parent
 * @param {HashName} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {Mtime} [options.mtime]
 * @param {number} [options.mode]
 */
const addToDirectory = async (context, options) => {
  options.parent.rmLink(options.name)
  options.parent.addLink(new DAGLink(options.name, options.size, options.cid))

  const node = UnixFS.unmarshal(options.parent.Data)

  if (node.mtime) {
    // Update mtime if previously set
    const ms = Date.now()
    const secs = Math.floor(ms / 1000)

    node.mtime = {
      secs: secs,
      nsecs: (ms - (secs * 1000)) * 1000
    }

    options.parent = new DAGNode(node.marshal(), options.parent.Links)
  }

  const hashAlg = mh.names[options.hashAlg]

  // Persist the new parent DAGNode
  const cid = await context.ipld.put(options.parent, mc.DAG_PB, {
    cidVersion: options.cidVersion,
    hashAlg,
    onlyHash: !options.flush
  })

  return {
    node: options.parent,
    cid,
    size: options.parent.size
  }
}

/**
 * @param {MfsContext} context
 * @param {object} options
 * @param {CID} options.cid
 * @param {string} options.name
 * @param {number} options.size
 * @param {DAGNode} options.parent
 * @param {HashName} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 */
const addToShardedDirectory = async (context, options) => {
  const {
    shard, path
  } = await addFileToShardedDirectory(context, options)

  const result = await last(shard.flush(context.block))
  /** @type {DAGNode} */
  const node = await context.ipld.get(result.cid)

  // we have written out the shard, but only one sub-shard will have been written so replace it in the original shard
  const oldLink = options.parent.Links
    .find(link => link.Name.substring(0, 2) === path[0].prefix)

  /** @type {DAGLink | undefined} */
  const newLink = node.Links
    .find(link => link.Name.substring(0, 2) === path[0].prefix)

  if (!newLink) {
    throw new Error(`No link found with prefix ${path[0].prefix}`)
  }

  if (oldLink) {
    options.parent.rmLink(oldLink.Name)
  }

  options.parent.addLink(newLink)

  return updateHamtDirectory(context, options.parent.Links, path[0].bucket, options)
}

/**
 * @param {MfsContext} context
 * @param {object} options
 * @param {CID} options.cid
 * @param {string} options.name
 * @param {number} options.size
 * @param {DAGNode} options.parent
 * @param {HashName} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 */
const addFileToShardedDirectory = async (context, options) => {
  const file = {
    name: options.name,
    cid: options.cid,
    size: options.size
  }

  // start at the root bucket and descend, loading nodes as we go
  const rootBucket = await recreateInitialHamtLevel(options.parent.Links)
  const node = UnixFS.unmarshal(options.parent.Data)
  const importerOptions = defaultImporterOptions()

  const shard = new DirSharded({
    root: true,
    dir: true,
    parent: null,
    parentKey: null,
    path: '',
    dirty: true,
    flat: false,
    mode: node.mode
  }, {
    hamtHashFn: importerOptions.hamtHashFn,
    hamtHashCode: importerOptions.hamtHashCode,
    hamtBucketBits: importerOptions.hamtBucketBits,
    ...options
  })
  shard._bucket = rootBucket

  if (node.mtime) {
    // update mtime if previously set
    shard.mtime = new Date()
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
      .find(link => link.Name.substring(0, 2) === segment.prefix)

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

    if (link.Name.length > 2) {
      // another file had the same prefix, will be replaced with a subshard
      log(`Link ${link.Name} ${link.Hash} will be replaced with a subshard`)
      index = path.length

      break
    }

    // load sub-shard
    log(`Found subshard ${segment.prefix}`)
    const subShard = await context.ipld.get(link.Hash)

    // subshard hasn't been loaded, descend to the next level of the HAMT
    if (!path[index]) {
      log(`Loaded new subshard ${segment.prefix}`)
      await recreateHamtLevel(subShard.Links, rootBucket, segment.bucket, parseInt(segment.prefix, 16))

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
    await addLinksToHamtBucket(subShard.Links, nextSegment.bucket, rootBucket)

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
 * @returns {{ bucket: Bucket, prefix: string, node?: DAGNode }[]}
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

module.exports = addLink
