'use strict'

const {
  DAGLink
} = require('ipld-dag-pb')
const CID = require('cids')
const log = require('debug')('ipfs:mfs:core:utils:add-link')
const UnixFS = require('ipfs-unixfs')
const DirSharded = require('ipfs-unixfs-importer/src/dir-sharded')
const {
  updateHamtDirectory,
  recreateHamtLevel,
  createShard,
  toPrefix,
  addLinksToHamtBucket
} = require('./hamt-utils')
const errCode = require('err-code')
const mc = require('multicodec')
const mh = require('multihashes')
const last = require('async-iterator-last')

const addLink = async (context, options) => {
  if (!options.parentCid && !options.parent) {
    throw errCode(new Error('No parent node or CID passed to addLink'), 'EINVALIDPARENT')
  }

  if (options.parentCid && !CID.isCID(options.parentCid)) {
    throw errCode(new Error('Invalid CID passed to addLink'), 'EINVALIDPARENTCID')
  }

  if (!options.parent) {
    log(`Loading parent node ${options.parentCid}`)

    options.parent = await context.ipld.get(options.parentCid)
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

  const meta = UnixFS.unmarshal(options.parent.Data)

  if (meta.type === 'hamt-sharded-directory') {
    log('Adding link to sharded directory')

    return addToShardedDirectory(context, options)
  }

  if (options.parent.Links.length >= options.shardSplitThreshold) {
    log('Converting directory to sharded directory')

    return convertToShardedDirectory(context, options)
  }

  log(`Adding ${options.name} (${options.cid}) to regular directory`)

  return addToDirectory(context, options)
}

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

const addToDirectory = async (context, options) => {
  options.parent.rmLink(options.name)
  options.parent.addLink(new DAGLink(options.name, options.size, options.cid))

  const format = mc[options.format.toUpperCase().replace(/-/g, '_')]
  const hashAlg = mh.names[options.hashAlg]

  // Persist the new parent DAGNode
  const cid = await context.ipld.put(options.parent, format, {
    cidVersion: options.cidVersion,
    hashAlg,
    hashOnly: !options.flush
  })

  return {
    node: options.parent,
    cid
  }
}

const addToShardedDirectory = async (context, options) => {
  const {
    shard, path
  } = await addFileToShardedDirectory(context, options)

  const result = await last(shard.flush('', context.ipld))

  // we have written out the shard, but only one sub-shard will have been written so replace it in the original shard
  const oldLink = options.parent.Links
    .find(link => link.Name.substring(0, 2) === path[0].prefix)

  const newLink = result.node.Links
    .find(link => link.Name.substring(0, 2) === path[0].prefix)

  if (oldLink) {
    options.parent.rmLink(oldLink.Name)
  }

  options.parent.addLink(newLink)

  return updateHamtDirectory(context, options.parent.Links, path[0].bucket, options)
}

const addFileToShardedDirectory = async (context, options) => {
  const file = {
    name: options.name,
    cid: options.cid,
    size: options.size
  }

  // start at the root bucket and descend, loading nodes as we go
  const rootBucket = await recreateHamtLevel(options.parent.Links)

  const shard = new DirSharded({
    root: true,
    dir: true,
    parent: null,
    parentKey: null,
    path: '',
    dirty: true,
    flat: false
  }, options)
  shard._bucket = rootBucket

  // load subshards until the bucket & position no longer changes
  const position = await rootBucket._findNewBucketAndPos(file.name)
  const path = toBucketPath(position)
  path[0].node = options.parent
  let index = 0

  while (index < path.length) {
    const segment = path[index]
    index++
    const node = segment.node

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
      log(`Link ${link.Name} will be replaced with a subshard`)
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

    // add next level's worth of links to bucket
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

const toBucketPath = (position) => {
  let bucket = position.bucket
  let positionInBucket = position.pos
  const path = [{
    bucket,
    prefix: toPrefix(positionInBucket)
  }]

  bucket = position.bucket._parent
  positionInBucket = position.bucket._posAtParent

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
