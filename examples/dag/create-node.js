'use strict'

const series = require('async/series')

const IPFS = require('../../src/core')
// In your project, replace by the following line and install IPFS as a dep
// const IPFS = require('ipfs')

function createNode (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  options.path = options.path || '/tmp/ipfs' + Math.random()

  const node = new IPFS({
    repo: options.path
  })

  series([
    (cb) => node.init({ emptyRepo: true, bits: 2048 }, cb),
    (cb) => node.load(cb),
    (cb) => node.goOnline(cb)
  ], (err) => callback(err, node))
}

module.exports = createNode
