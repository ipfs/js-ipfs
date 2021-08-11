/* eslint-env mocha */
'use strict'

const { MemoryBlockstore } = require('interface-blockstore')
const suite = require('interface-blockstore-tests')
const BlockStorage = require('../src/block-storage')

/**
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 */

class MockBitswap extends MemoryBlockstore {
  /**
   * @param {boolean} started
   */
  constructor (started) {
    super()

    this.isStarted = () => started
  }
}

describe('block-storage', () => {
  describe('interface-blockstore (bitswap online)', () => {
    suite({
      setup: () => {
        // bitswap forwards on to the blockstore so just
        // use the same instance to represent both
        const blockstore = new MockBitswap(true)

        // @ts-ignore MockBitswap is missing some properties
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
        const blockstore = new MockBitswap(false)

        // @ts-ignore MockBitswap is missing some properties
        return new BlockStorage(blockstore, blockstore)
      },
      teardown: () => {}
    })
  })
})
