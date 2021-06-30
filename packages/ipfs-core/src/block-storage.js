'use strict'

const { BlockstoreAdapter } = require('interface-blockstore')

/**
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-bitswap')} Bitswap
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/block').RmOptions} RmOptions
 */

/**
 * BlockStorage is a hybrid block datastore. It stores data in a local
 * datastore and may retrieve data from a remote Exchange.
 * It uses an internal `datastore.Datastore` instance to store values.
 */
class BlockStorage extends BlockstoreAdapter {
  /**
   * Create a new BlockStorage
   *
   * @param {import('interface-blockstore').Blockstore} blockstore
   */
  constructor (blockstore) {
    super()

    this.child = blockstore

    /** @type {Bitswap | null} */
    this._bitswap = null
  }

  /**
   * Add a bitswap instance that communicates with the
   * network to retreive blocks that are not in the local store.
   *
   * If the node is online all requests for blocks first
   * check locally and afterwards ask the network for the blocks.
   *
   * @param {Bitswap} bitswap
   */
  setExchange (bitswap) {
    this._bitswap = bitswap
  }

  /**
   * Go offline, i.e. drop the reference to bitswap
   */
  unsetExchange () {
    this._bitswap = null
  }

  /**
   * Is the blockservice online, i.e. is bitswap present
   */
  hasExchange () {
    return this._bitswap != null
  }

  /**
   * Put a block to the underlying datastore
   *
   * @param {CID} cid
   * @param {Uint8Array} block
   * @param {AbortOptions} [options]
   */
  async put (cid, block, options = {}) {
    if (this._bitswap != null) {
      await this._bitswap.put(cid, block, options)
    } else {
      await this.child.put(cid, block, options)
    }
  }

  /**
   * Put a multiple blocks to the underlying datastore
   *
   * @param {AsyncIterable<{ key: CID, value: Uint8Array }> | Iterable<{ key: CID, value: Uint8Array }>} blocks
   * @param {AbortOptions} [options]
   */
  async * putMany (blocks, options = {}) {
    if (this._bitswap != null) {
      yield * this._bitswap.putMany(blocks, options)
    } else {
      yield * this.child.putMany(blocks, options)
    }
  }

  /**
   * Get a block by cid
   *
   * @param {CID} cid
   * @param {AbortOptions} [options]
   */
  async get (cid, options = {}) {
    if (this._bitswap != null) {
      return this._bitswap.get(cid, options)
    } else {
      return this.child.get(cid, options)
    }
  }

  /**
   * Get multiple blocks back from an array of cids
   *
   * @param {AsyncIterable<CID> | Iterable<CID>} cids
   * @param {AbortOptions} [options]
   */
  async * getMany (cids, options = {}) {
    if (this._bitswap != null) {
      yield * this._bitswap.getMany(cids, options)
    } else {
      yield * this.child.getMany(cids, options)
    }
  }

  /**
   * Delete a block from the blockstore
   *
   * @param {CID} cid
   * @param {RmOptions} [options]
   */
  async delete (cid, options) {
    this.child.delete(cid, options)
  }

  /**
   * Delete multiple blocks from the blockstore
   *
   * @param {AsyncIterable<CID> | Iterable<CID>} cids
   * @param {RmOptions} [options]
   */
  async * deleteMany (cids, options) {
    yield * this.child.deleteMany(cids, options)
  }
}

module.exports = BlockStorage
