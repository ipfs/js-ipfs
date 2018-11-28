'use strict'

const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')
const CID = require('cids')
const waterfall = require('async/waterfall')
const DirSharded = require('ipfs-unixfs-importer/src/importer/dir-sharded')
const series = require('async/series')
const log = require('debug')('ipfs:mfs:core:utils:add-link')
const UnixFS = require('ipfs-unixfs')
const Bucket = require('hamt-sharding')

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

  log('Adding to regular directory')

  addToDirectory(context, options, callback)
}

const addToDirectory = (context, options, callback) => {
  waterfall([
    (done) => {
      if (options.name) {
        // Remove the old link if necessary
        return DAGNode.rmLink(options.parent, options.name, done)
      }

      done(null, options.parent)
    },
    (parent, done) => {
      // Add the new link to the parent
      DAGNode.addLink(parent, new DAGLink(options.name, options.size, options.cid), done)
    },
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

const addToShardedDirectory = async (context, options, callback) => {
  const bucket = new Bucket({
    hashFn: DirSharded.hashFn
  })
  const position = await bucket._findNewBucketAndPos(options.name)
  const prefix = position.pos
    .toString('16')
    .toUpperCase()
    .padStart(2, '0')
    .substring(0, 2)

  const existingSubShard = options.parent.links
    .filter(link => link.name === prefix)
    .pop()

  if (existingSubShard) {
    log(`Descending into sub-shard ${prefix} to add link ${options.name}`)

    return addLink(context, {
      ...options,
      parent: null,
      parentCid: existingSubShard.cid
    }, (err, { cid, node }) => {
      if (err) {
        return callback(err)
      }

      // make sure parent is updated with new sub-shard cid
      addToDirectory(context, {
        ...options,
        parent: options.parent,
        parentCid: options.parentCid,
        name: prefix,
        size: node.size,
        cid: cid
      }, callback)
    })
  }

  const existingFile = options.parent.links
    .filter(link => link.name.substring(2) === options.name)
    .pop()

  if (existingFile) {
    log(`Updating file ${existingFile.name}`)

    return addToDirectory(context, {
      ...options,
      name: existingFile.name
    }, callback)
  }

  const existingUnshardedFile = options.parent.links
    .filter(link => link.name.substring(0, 2) === prefix)
    .pop()

  if (existingUnshardedFile) {
    log(`Replacing file ${existingUnshardedFile.name} with sub-shard`)

    return createShard(context, [{
      name: existingUnshardedFile.name.substring(2),
      size: existingUnshardedFile.size,
      multihash: existingUnshardedFile.cid.buffer
    }, {
      name: options.name,
      size: options.size,
      multihash: options.cid.buffer
    }], {
      root: false
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      const newShard = result.node.links[0]

      waterfall([
        (done) => DAGNode.rmLink(options.parent, existingUnshardedFile.name, done),
        (parent, done) => DAGNode.addLink(parent, newShard, done),
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
    })
  }

  log(`Appending ${prefix + options.name} to shard`)

  return addToDirectory(context, {
    ...options,
    name: prefix + options.name
  }, callback)
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

module.exports = addLink
