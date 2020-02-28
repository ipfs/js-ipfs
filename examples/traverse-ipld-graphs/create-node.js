'use strict'

const IPFS = require('ipfs')

function createNode (options) {
  options = options || {}
  options.path = options.path || '/tmp/ipfs' + Math.random()
  return IPFS.create({ repo: options.path })
}

module.exports = createNode
