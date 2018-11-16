'use strict'

const waterfall = require('async/waterfall')
const UnixFS = require('ipfs-unixfs')
const {
  DAGNode
} = require('ipld-dag-pb')

const createNode = (context, type, options, callback) => {
  waterfall([
    (done) => DAGNode.create(new UnixFS(type).marshal(), [], done),
    (node, done) => context.ipld.put(node, {
      version: options.cidVersion,
      format: options.format,
      hashAlg: options.hashAlg
    }, (err, cid) => done(err, {
      cid,
      node
    }))
  ], callback)
}

module.exports = createNode
