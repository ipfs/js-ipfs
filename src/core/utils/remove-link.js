'use strict'

const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')
const waterfall = require('async/waterfall')
const CID = require('cids')
const log = require('debug')('ipfs:mfs:core:utils:remove-link')
const UnixFS = require('ipfs-unixfs')
const {
  generatePath,
  updateHamtDirectory
} = require('./hamt-utils')

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
    log(`Removing ${options.name} from sharded directory`)

    return removeFromShardedDirectory(context, options, callback)
  }

  log(`Removing link ${options.name} regular directory`)

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

const removeFromShardedDirectory = (context, options, callback) => {
  return waterfall([
    (cb) => generatePath(context, options.name, options.parent, cb),
    ({ rootBucket, path }, cb) => {
      rootBucket.del(options.name)
        .then(() => cb(null, { rootBucket, path }), cb)
    },
    ({ rootBucket, path }, cb) => {
      updateShard(context, path, {
        name: options.name,
        cid: options.cid,
        size: options.size
      }, options, (err, result = {}) => cb(err, { rootBucket, ...result }))
    },
    ({ rootBucket, node }, cb) => updateHamtDirectory(context, node.links, rootBucket, options, cb)
  ], callback)
}

const updateShard = (context, positions, child, options, callback) => {
  const {
    bucket,
    prefix,
    node
  } = positions.pop()

  const link = node.links
    .find(link => link.name.substring(0, 2) === prefix)

  if (!link) {
    return callback(new Error(`No link found with prefix ${prefix} for file ${child.name}`))
  }

  return waterfall([
    (cb) => {
      if (link.name === `${prefix}${child.name}`) {
        log(`Removing existing link ${link.name}`)

        return waterfall([
          (done) => DAGNode.rmLink(node, link.name, done),
          (node, done) => {
            context.ipld.put(node, {
              version: options.cidVersion,
              format: options.codec,
              hashAlg: options.hashAlg,
              hashOnly: !options.flush
            }, (error, cid) => done(error, {
              node,
              cid
            }))
          },
          (result, done) => {
            bucket.del(child.name)
              .then(() => done(null, result), done)
          },
          (result, done) => updateHamtDirectory(context, result.node.links, bucket, options, done)
        ], cb)
      }

      log(`Descending into sub-shard ${link.name} for ${prefix}${child.name}`)

      return waterfall([
        (cb) => updateShard(context, positions, child, options, cb),
        (result, cb) => {
          let newName = prefix

          if (result.node.links.length === 1) {
            log(`Removing subshard for ${prefix}`)

            // convert shard back to normal dir
            result.cid = result.node.links[0].cid
            result.node = result.node.links[0]

            newName = `${prefix}${result.node.name.substring(2)}`
          }

          log(`Updating shard ${prefix} with name ${newName}`)

          updateShardParent(context, bucket, node, prefix, newName, result.node.size, result.cid, options, cb)
        }
      ], cb)
    }
  ], callback)
}

const updateShardParent = async (context, bucket, parent, oldName, newName, size, cid, options, callback) => {
  waterfall([
    (done) => DAGNode.rmLink(parent, oldName, done),
    (parent, done) => DAGNode.addLink(parent, new DAGLink(newName, size, cid), done),
    (parent, done) => updateHamtDirectory(context, parent.links, bucket, options, done)
  ], callback)
}

module.exports = removeLink
