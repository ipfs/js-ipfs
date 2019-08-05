'use strict'

const {
  DAGNode
} = require('ipld-dag-pb')
const Bucket = require('hamt-sharding/src/bucket')
const DirSharded = require('ipfs-unixfs-importer/src/dir-sharded')
const log = require('debug')('ipfs:mfs:core:utils:hamt-utils')
const UnixFS = require('ipfs-unixfs')
const mc = require('multicodec')
const mh = require('multihashes')
const last = require('async-iterator-last')

const updateHamtDirectory = async (context, links, bucket, options) => {
  // update parent with new bit field
  const data = Buffer.from(bucket._children.bitField().reverse())
  const dir = new UnixFS('hamt-sharded-directory', data)
  dir.fanout = bucket.tableSize()
  dir.hashType = DirSharded.hashFn.code

  const format = mc[options.format.toUpperCase().replace(/-/g, '_')]
  const hashAlg = mh.names[options.hashAlg]

  const parent = new DAGNode(dir.marshal(), links)
  const cid = await context.ipld.put(parent, format, {
    cidVersion: options.cidVersion,
    hashAlg,
    hashOnly: !options.flush
  })

  return {
    node: parent,
    cid
  }
}

const recreateHamtLevel = async (links, rootBucket, parentBucket, positionAtParent) => {
  // recreate this level of the HAMT
  const bucket = new Bucket({
    hashFn: DirSharded.hashFn,
    hash: parentBucket ? parentBucket._options.hash : undefined
  }, parentBucket, positionAtParent)

  if (parentBucket) {
    parentBucket._putObjectAt(positionAtParent, bucket)
  }

  await addLinksToHamtBucket(links, bucket, rootBucket)

  return bucket
}

const addLinksToHamtBucket = async (links, bucket, rootBucket) => {
  await Promise.all(
    links.map(link => {
      if (link.Name.length === 2) {
        const pos = parseInt(link.Name, 16)

        bucket._putObjectAt(pos, new Bucket({
          hashFn: DirSharded.hashFn
        }, bucket, pos))

        return Promise.resolve()
      }

      return (rootBucket || bucket).put(link.Name.substring(2), {
        size: link.TSize,
        cid: link.Hash
      })
    })
  )
}

const toPrefix = (position) => {
  return position
    .toString('16')
    .toUpperCase()
    .padStart(2, '0')
    .substring(0, 2)
}

const generatePath = async (context, fileName, rootNode) => {
  // start at the root bucket and descend, loading nodes as we go
  const rootBucket = await recreateHamtLevel(rootNode.Links, null, null, null)
  const position = await rootBucket._findNewBucketAndPos(fileName)

  // the path to the root bucket
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

    currentBucket = currentBucket._parent
  }

  path.reverse()
  path[0].node = rootNode

  // load DAGNode for each path segment
  for (let i = 0; i < path.length; i++) {
    const segment = path[i]

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

const createShard = async (context, contents, options) => {
  const shard = new DirSharded({
    root: true,
    dir: true,
    parent: null,
    parentKey: null,
    path: '',
    dirty: true,
    flat: false
  }, options)

  for (let i = 0; i < contents.length; i++) {
    await shard._bucket.put(contents[i].name, {
      size: contents[i].size,
      cid: contents[i].cid
    })
  }

  return last(shard.flush('', context.ipld, null))
}

module.exports = {
  generatePath,
  updateHamtDirectory,
  recreateHamtLevel,
  addLinksToHamtBucket,
  toPrefix,
  createShard
}
