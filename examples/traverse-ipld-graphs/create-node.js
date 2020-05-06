'use strict'

const IPFS = require('ipfs')

function createNode (options) {
  options = options || {}
  options.path = options.path || '/tmp/ipfs' + Math.random()
  return IPFS.create({
    repo: options.path,
    ipld: {
      formats: [
        require('ipld-dag-cbor'),
        require('ipld-dag-pb'),
        require('ipld-raw'),
        require('ipld-bitcoin'),
        require('ipld-ethereum').ethAccountSnapshot,
        require('ipld-ethereum').ethBlock,
        require('ipld-ethereum').ethBlockList,
        require('ipld-ethereum').ethStateTrie,
        require('ipld-ethereum').ethStorageTrie,
        require('ipld-ethereum').ethTx,
        require('ipld-ethereum').ethTxTrie,
        require('ipld-git'),
        require('ipld-zcash')
      ]
    },
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
