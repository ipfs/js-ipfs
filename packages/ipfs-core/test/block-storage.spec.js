/* eslint-env mocha */
'use strict'

const { MemoryBlockstore } = require('interface-blockstore')
const suite = require('interface-blockstore-tests')
const BlockStorage = require('../src/block-storage')

/**
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 */

describe('block-storage', () => {
  describe('interface-blockstore (bitswap online)', () => {
    suite({
      setup: () => {
        // bitswap forwards on to the blockstore so just
        // use the same instance to represent both
        const blockstore = new MemoryBlockstore()
        blockstore.isStarted = () => true

        return new BlockStorage(blockstore, blockstore)
      },
      teardown: () => {}
    })
  })

  describe('interface-blockstore (bitswap offline)', () => {
    suite({
      setup: () => {
        // bitswap forwards on to the blockstore so just
        // use the same instance to represent both
        const blockstore = new MemoryBlockstore()
        blockstore.isStarted = () => false

        return new BlockStorage(blockstore, blockstore)
      },
      teardown: () => {}
    })
  })
})
