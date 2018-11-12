'use strict'

const {
  DAGNode,
  DAGLink,
  util: {
    cid
  }
} = require('ipld-dag-pb')
const waterfall = require('async/waterfall')

const defaultOptions = {
  parent: undefined,
  cid: undefined,
  name: '',
  size: undefined,
  flush: true,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  codec: 'dag-pb'
}

const addLink = (context, options, callback) => {
  options = Object.assign({}, defaultOptions, options)

  if (!options.parent) {
    return callback(new Error('No parent DAGNode passed to addLink'))
  }

  if (!options.cid) {
    return callback(new Error('No child cid passed to addLink'))
  }

  if (!options.size) {
    return callback(new Error('No child size passed to addLink'))
  }

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
      if (!options.flush) {
        return cid(parent, {
          version: options.cidVersion,
          hashAlg: options.hashAlg
        }, (err, cid) => {
          done(err, {
            node: parent,
            cid
          })
        })
      }

      // Persist the new parent DAGNode
      context.ipld.put(parent, {
        version: options.cidVersion,
        format: options.codec,
        hashAlg: options.hashAlg
      }, (error, cid) => done(error, {
        node: parent,
        cid
      }))
    }
  ], callback)
}

module.exports = addLink
