'use strict'

const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')
const CID = require('cids')
const waterfall = require('async/waterfall')
const whilst = require('async/whilst')
const log = require('debug')('ipfs:mfs:core:utils:add-link')
const UnixFS = require('ipfs-unixfs')
const DirSharded = require('ipfs-unixfs-importer/src/importer/dir-sharded')
const {
  updateHamtDirectory,
  recreateHamtLevel,
  createShard,
  toPrefix,
  addLinksToHamtBucket
} = require('./hamt-utils')

const defaultOptions = {
  parent: undefined,
  cid: undefined,
  name: '',
  size: undefined,
  flush: true,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  codec: 'dag-pb',
  shardSplitThreshold: 1000
}

const addLink = (context, options, callback) => {
  options = Object.assign({}, defaultOptions, options)

  if (!options.parentCid) {
    return callback(new Error('No parent CID passed to addLink'))
  }

  if (!CID.isCID(options.parentCid)) {
    return callback(new Error('Invalid CID passed to addLink'))
  }

  if (!options.parent) {
    log('Loading parent node', options.parentCid.toBaseEncodedString())

    return waterfall([
      (cb) => context.ipld.get(options.parentCid, cb),
      (result, cb) => cb(null, result.value),
      (node, cb) => addLink(context, {
        ...options,
        parent: node
      }, cb)
    ], callback)
  }

  if (!options.cid) {
    return callback(new Error('No child cid passed to addLink'))
  }

  if (!options.name) {
    return callback(new Error('No child name passed to addLink'))
  }

  if (!CID.isCID(options.cid)) {
    options.cid = new CID(options.cid)
  }

  if (!options.size && options.size !== 0) {
    return callback(new Error('No child size passed to addLink'))
  }

  const meta = UnixFS.unmarshal(options.parent.data)

  if (meta.type === 'hamt-sharded-directory') {
    log('Adding link to sharded directory')

    return addToShardedDirectory(context, options, callback)
  }

  if (options.parent.links.length >= options.shardSplitThreshold) {
    log('Converting directory to sharded directory')

    return convertToShardedDirectory(context, options, callback)
  }

  log(`Adding ${options.name} to regular directory`)

  addToDirectory(context, options, callback)
}

const convertToShardedDirectory = (context, options, callback) => {
  createShard(context, options.parent.links.map(link => ({
    name: link.name,
    size: link.size,
    multihash: link.cid.buffer
  })).concat({
    name: options.name,
    size: options.size,
    multihash: options.cid.buffer
  }), {}, (err, result) => {
    if (!err) {
      log('Converted directory to sharded directory', result.cid.toBaseEncodedString())
    }

    callback(err, result)
  })
}

const addToDirectory = (context, options, callback) => {
  waterfall([
    (done) => DAGNode.rmLink(options.parent, options.name, done),
    (parent, done) => DAGNode.addLink(parent, new DAGLink(options.name, options.size, options.cid), done),
    (parent, done) => {
      // Persist the new parent DAGNode
      context.ipld.put(parent, {
        version: options.cidVersion,
        format: options.codec,
        hashAlg: options.hashAlg,
        hashOnly: !options.flush
      }, (error, cid) => done(error, {
        node: parent,
        cid
      }))
    }
  ], callback)
}

const addToShardedDirectory = (context, options, callback) => {
  return addFileToShardedDirectoryy(context, options, (err, result) => {
    if (err) {
      return callback(err)
    }

    const {
      shard, path
    } = result

    shard.flush('', context.ipld, null, async (err, result) => {
      if (err) {
        return callback(err)
      }

      // we have written out the shard, but only one sub-shard will have been written so replace it in the original shard
      const oldLink = options.parent.links
        .find(link => link.name.substring(0, 2) === path[0].prefix)

      const newLink = result.node.links
        .find(link => link.name.substring(0, 2) === path[0].prefix)

      waterfall([
        (done) => {
          if (!oldLink) {
            return done(null, options.parent)
          }

          DAGNode.rmLink(options.parent, oldLink.name, done)
        },
        (parent, done) => DAGNode.addLink(parent, newLink, done),
        (parent, done) => updateHamtDirectory(context, parent.links, path[0].bucket, options, done)
      ], callback)
    })
  })
}

const addFileToShardedDirectoryy = (context, options, callback) => {
  const file = {
    name: options.name,
    cid: options.cid,
    size: options.size
  }

  // start at the root bucket and descend, loading nodes as we go
  recreateHamtLevel(options.parent.links, null, null, null, async (err, rootBucket) => {
    if (err) {
      return callback(err)
    }

    const shard = new DirSharded({
      root: true,
      dir: true,
      parent: null,
      parentKey: null,
      path: '',
      dirty: true,
      flat: false
    })
    shard._bucket = rootBucket

    // load subshards until the bucket & position no longer changes
    const position = await rootBucket._findNewBucketAndPos(file.name)
    const path = toBucketPath(position)
    path[0].node = options.parent
    let index = 0

    whilst(
      () => index < path.length,
      (next) => {
        let segment = path[index]
        index++
        let node = segment.node

        let link = node.links
          .find(link => link.name.substring(0, 2) === segment.prefix)

        if (!link) {
          // prefix is new, file will be added to the current bucket
          log(`Link ${segment.prefix}${file.name} will be added`)
          index = path.length
          return next(null, shard)
        }

        if (link.name === `${segment.prefix}${file.name}`) {
          // file already existed, file will be added to the current bucket
          log(`Link ${segment.prefix}${file.name} will be replaced`)
          index = path.length
          return next(null, shard)
        }

        if (link.name.length > 2) {
          // another file had the same prefix, will be replaced with a subshard
          log(`Link ${link.name} will be replaced with a subshard`)
          index = path.length
          return next(null, shard)
        }

        // load sub-shard
        log(`Found subshard ${segment.prefix}`)
        context.ipld.get(link.cid, (err, result) => {
          if (err) {
            return next(err)
          }

          // subshard hasn't been loaded, descend to the next level of the HAMT
          if (!path[index]) {
            log(`Loaded new subshard ${segment.prefix}`)
            const node = result.value

            return recreateHamtLevel(node.links, rootBucket, segment.bucket, parseInt(segment.prefix, 16), async (err) => {
              if (err) {
                return next(err)
              }

              const position = await rootBucket._findNewBucketAndPos(file.name)

              path.push({
                bucket: position.bucket,
                prefix: toPrefix(position.pos),
                node: node
              })

              return next(null, shard)
            })
          }

          const nextSegment = path[index]

          // add next level's worth of links to bucket
          addLinksToHamtBucket(result.value.links, nextSegment.bucket, rootBucket, (error) => {
            nextSegment.node = result.value

            next(error, shard)
          })
        })
      },
      (err, shard) => {
        if (err) {
          return callback(err)
        }

        // finally add the new file into the shard
        shard.put(file.name, {
          size: file.size,
          multihash: file.cid.buffer
        }, (err) => {
          callback(err, {
            shard, path
          })
        })
      }
    )
  })
}

const toBucketPath = (position) => {
  let bucket = position.bucket
  let positionInBucket = position.pos
  let path = [{
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
