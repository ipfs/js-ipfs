'use strict'

const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')
const waterfall = require('async/waterfall')
const CID = require('cids')
const DirSharded = require('ipfs-unixfs-importer/src/importer/dir-sharded')
const log = require('debug')('ipfs:mfs:core:utils:remove-link')
const UnixFS = require('ipfs-unixfs')
const Bucket = require('hamt-sharding')

const defaultOptions = {
  parent: undefined,
  parentCid: undefined,
  name: '',
  flush: true,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  codec: 'dag-pb',
  shardSplitThreshold: 1000
}

const removeLink = (context, options, callback) => {
  options = Object.assign({}, defaultOptions, options)

  if (!options.parentCid) {
    return callback(new Error('No parent CID passed to removeLink'))
  }

  if (!CID.isCID(options.parentCid)) {
    return callback(new Error('Invalid CID passed to addLink'))
  }

  if (!options.parent) {
    log('Loading parent node', options.parentCid.toBaseEncodedString())

    return waterfall([
      (cb) => context.ipld.get(options.parentCid, cb),
      (result, cb) => cb(null, result.value),
      (node, cb) => removeLink(context, {
        ...options,
        parent: node
      }, cb)
    ], callback)
  }

  if (!options.name) {
    return callback(new Error('No child name passed to removeLink'))
  }

  const meta = UnixFS.unmarshal(options.parent.data)

  if (meta.type === 'hamt-sharded-directory') {
    log('Removing link from sharded directory')

    return removeFromShardedDirectory(context, options, callback)
  }

  log('Removing link from regular directory')

  return removeFromDirectory(context, options, callback)
}

const removeFromDirectory = (context, options, callback) => {
  waterfall([
    (cb) => DAGNode.rmLink(options.parent, options.name, cb),
    (newParentNode, cb) => {
      context.ipld.put(newParentNode, {
        version: options.cidVersion,
        format: options.codec,
        hashAlg: options.hashAlg
      }, (error, cid) => cb(error, {
        node: newParentNode,
        cid
      }))
    },
    (result, cb) => {
      log('Updated regular directory', result.cid.toBaseEncodedString())

      cb(null, result)
    }
  ], callback)
}

const removeFromShardedDirectory = async (context, options, callback) => {
  const bucket = new Bucket({
    hashFn: DirSharded.hashFn
  })
  const position = await bucket._findNewBucketAndPos(options.name)
  const prefix = position.pos
    .toString('16')
    .toUpperCase()
    .padStart(2, '0')
    .substring(0, 2)

  const existingLink = options.parent.links
    .filter(link => link.name.substring(2) === options.name)
    .pop()

  if (existingLink) {
    return waterfall([
      (done) => DAGNode.rmLink(options.parent, existingLink.name, done),
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

  const subShard = options.parent.links
    .filter(link => link.name === prefix)
    .pop()

  if (!subShard) {
    return callback(new Error(`Could not find ${prefix} in ${options.parent.links.map(link => link.name)} for ${options.name}`))
  }

  return removeLink(context, {
    ...options,
    parent: null,
    parentCid: subShard.cid
  }, (err, { cid }) => {
    if (err) {
      return callback(err)
    }

    // make sure parent is updated with new sub-shard cid
    waterfall([
      (cb) => DAGNode.rmLink(options.parent, prefix, cb),
      (node, cb) => DAGNode.addLink(node, new DAGLink(prefix, node.size, cid), cb),
      (node, cb) => {
        // Persist the new parent DAGNode
        context.ipld.put(node, {
          version: options.cidVersion,
          format: options.codec,
          hashAlg: options.hashAlg,
          hashOnly: !options.flush
        }, (error, cid) => cb(error, {
          node,
          cid
        }))
      }
    ], callback)
  })
}

module.exports = removeLink
