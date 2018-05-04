'use strict'

const waterfall = require('async/waterfall')
const {
  DAGNode
} = require('ipld-dag-pb')

const defaultOptions = {
  format: 'dag-pb',
  hashAlg: 'sha2-256'
}

const createNode = (ipfs, data, links, options, callback) => {
  options = Object.assign({}, defaultOptions, options)

  waterfall([
    // Create a DAGNode with the new data
    (cb) => DAGNode.create(data, links, cb),
    (newNode, cb) => {
      // Persist it
      ipfs.dag.put(newNode, {
        format: options.format,
        hashAlg: options.hashAlg
      }, (error) => cb(error, newNode))
    }
  ], callback)
}

module.exports = createNode
