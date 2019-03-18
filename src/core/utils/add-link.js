'use strict'

const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')
const CID = require('cids')
const waterfall = require('async/waterfall')
const DirSharded = require('ipfs-unixfs-importer/src/importer/dir-sharded')
const series = require('async/series')
const whilst = require('async/whilst')
const log = require('debug')('ipfs:mfs:core:utils:add-link')
const UnixFS = require('ipfs-unixfs')
const {
  generatePath,
  updateHamtDirectory
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
  return waterfall([
    (cb) => generatePath(context, options.name, options.parent, cb),
    ({ rootBucket, path }, cb) => {
      updateShard(context, path.reverse(), {
        name: options.name,
        cid: options.cid,
        size: options.size
      }, 0, options, (err, result = {}) => cb(err, { rootBucket, ...result }))
    },
    ({ rootBucket, node }, cb) => updateHamtDirectory(context, node.links, rootBucket, options, cb)
  ], callback)
}

const updateShard = (context, positions, child, index, options, callback) => {
  const {
    bucket,
    prefix,
    node
  } = positions[index]

  const link = node.links
    .find(link => link.name.substring(0, 2) === prefix && link.name !== `${prefix}${child.name}`)

  return waterfall([
    (cb) => {
      if (link && link.name.length > 2) {
        log(`Converting existing file ${link.name} into sub-shard for ${child.name}`)

        return waterfall([
          (done) => createShard(context, [{
            name: link.name.substring(2),
            size: link.size,
            multihash: link.cid.buffer
          }, {
            name: child.name,
            size: child.size,
            multihash: child.cid.buffer
          }], {}, done),
          ({ node: { links: [ shard ] } }, done) => {
            let position = 0

            // step through the shard until we find the newly created sub-shard
            return whilst(
              () => position < positions.length - 1,
              (next) => {
                const shardPrefix = positions[position].prefix

                log(`Prefix at position ${position} is ${shardPrefix} - shard.name ${shard.name}`)

                if (shard.name.substring(0, 2) !== shardPrefix) {
                  return next(new Error(`Unexpected prefix ${shard.name} !== ${shardPrefix}, position ${position}`))
                }

                position++

                context.ipld.get(shard.cid, (err, result) => {
                  if (err) {
                    return next(err)
                  }

                  if (position < positions.length) {
                    const nextPrefix = positions[position].prefix
                    const nextShard = result.value.links.find(link => link.name.substring(0, 2) === nextPrefix)

                    if (nextShard) {
                      shard = nextShard
                    }
                  }

                  next(err, { cid: result && result.cid, node: result && result.value })
                })
              },
              done
            )
          },
          (result, cb) => updateShardParent(context, bucket, node, link.name, result.node, result.cid, prefix, options, cb)
        ], cb)
      }

      if (link && link.name.length === 2) {
        log(`Descending into sub-shard ${link.name} for ${child.name}`)

        return waterfall([
          (cb) => updateShard(context, positions, child, index + 1, options, cb),
          (result, cb) => updateShardParent(context, bucket, node, link.name, result.node, result.cid, prefix, options, cb)
        ], cb)
      }

      log(`Adding or replacing file`, prefix + child.name)
      updateShardParent(context, bucket, node, prefix + child.name, child, child.cid, prefix + child.name, options, cb)
    }
  ], callback)
}

const createShard = (context, contents, options, callback) => {
  const shard = new DirSharded({
    root: true,
    dir: true,
    parent: null,
    parentKey: null,
    path: '',
    dirty: true,
    flat: false,

    ...options
  })

  const operations = contents.map(contents => {
    return (cb) => {
      shard.put(contents.name, {
        size: contents.size,
        multihash: contents.multihash
      }, cb)
    }
  })

  return series(
    operations,
    (err) => {
      if (err) {
        return callback(err)
      }

      shard.flush('', context.ipld, null, callback)
    }
  )
}

const updateShardParent = (context, bucket, parent, name, node, cid, prefix, options, callback) => {
  waterfall([
    (done) => DAGNode.rmLink(parent, name, done),
    (parent, done) => DAGNode.addLink(parent, new DAGLink(prefix, node.size, cid), done),
    (parent, done) => updateHamtDirectory(context, parent.links, bucket, options, done)
  ], callback)
}

module.exports = addLink
