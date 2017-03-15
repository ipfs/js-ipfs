'use strict'

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

  node.on('start', () => callback(null, node))
}

module.exports = createNode
