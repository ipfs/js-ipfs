'use strict'

const IPFS = require('ipfs')

function createNode (options) {
  options = options || {}
  options.path = options.path || '/tmp/ipfs' + Math.random()
  return IPFS.create({
    repo: options.path,
    config: {
      Addresses: {
        Swarm: [
          '/ip4/0.0.0.0/tcp/0'
        ],
        API: '/ip4/127.0.0.1/tcp/0',
        Gateway: '/ip4/127.0.0.1/tcp/0'
      }
    }
  })
}

module.exports = createNode
