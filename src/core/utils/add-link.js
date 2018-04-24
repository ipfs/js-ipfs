'use strict'

const CID = require('cids')
const dagPb = require('ipld-dag-pb')
const {
  DAGNode,
  DAGLink
} = dagPb
const waterfall = require('async/waterfall')

const addLink = (ipfs, options, callback) => {
  options = Object.assign({}, {
    parent: undefined,
    child: undefined,
    name: undefined,
    flush: true
  }, options)

  if (!options.parent) {
    return callback(new Error('No parent passed to addLink'))
  }

  if (!options.child) {
    return callback(new Error('No child passed to addLink'))
  }

  if (!options.name) {
    return callback(new Error('No name passed to addLink'))
  }

  waterfall([
    (done) => {
      // Remove the old link if necessary
      DAGNode.rmLink(options.parent, options.name, done)
    },
    (parent, done) => {
      // Add the new link to the parent
      DAGNode.addLink(parent, new DAGLink(options.name, options.child.size, options.child.hash || options.child.multihash), done)
    },
    (parent, done) => {
      if (!options.flush) {
        return done()
      }

      // Persist the new parent DAGNode
      ipfs.dag.put(parent, {
        cid: new CID(parent.hash || parent.multihash)
      }, (error) => done(error, parent))
    }
  ], callback)
}

module.exports = addLink
