'use strict'

const { BlockstoreAdapter } = require('interface-blockstore')
const merge = require('it-merge')
const pushable = require('it-pushable')

/**
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 * @typedef {import('interface-blockstore').Query} Query
 * @typedef {import('interface-blockstore').KeyQuery} KeyQuery
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-bitswap').IPFSBitswap} Bitswap
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/block').RmOptions} RmOptions
 */

/**
 * BlockStorage is a hybrid block datastore. It stores data in a local
 * datastore and may retrieve data from a remote Exchange.
 * It uses an internal `datastore.Datastore` instance to store values.
 *
 * @implements {Blockstore}
 */
class BlockStorage extends BlockstoreAdapter {
  /**
   * Create a new BlockStorage
   *
   * @param {Blockstore} blockstore
   * @param {Bitswap} bitswap
   */
  constructor (blockstore, bitswap) {
    super()

    this.child = blockstore
    this.bitswap = bitswap
  }

  open () {
    return this.child.open()
  }

  close () {
    return this.child.close()
  }

  unwrap () {
    return this.child
  }

  /**
   * Put a block to the underlying datastore
   *
   * @param {CID} cid
   * @param {Uint8Array} block
   * @param {AbortOptions} [options]
   */
  async put (cid, block, options = {}) {
    if (this.bitswap.isStarted()) {
      await this.bitswap.put(cid, block, options)
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
    if (this.bitswap.isStarted()) {
      yield * this.bitswap.putMany(blocks, options)
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
    if (!(await this.has(cid)) && this.bitswap.isStarted()) {
      return this.bitswap.get(cid, options)
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
    const getFromBitswap = pushable()
    const getFromChild = pushable()

    Promise.resolve().then(async () => {
      for await (const cid of cids) {
        if (!(await this.has(cid)) && this.bitswap.isStarted()) {
          getFromBitswap.push(cid)
        } else {
          getFromChild.push(cid)
        }
      }

      getFromBitswap.end()
      getFromChild.end()
    })

    yield * merge(
      this.bitswap.getMany(getFromBitswap, options),
      this.child.getMany(getFromChild, options)
    )
  }

  /**
   * Delete a block from the blockstore
   *
   * @param {CID} cid
   * @param {RmOptions} [options]
   */
  async delete (cid, options) {
    await this.child.delete(cid, options)
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

  /**
   * @param {CID} cid
   * @param {AbortOptions} options
   */
  async has (cid, options = {}) {
    return this.child.has(cid, options)
  }

  /**
   * @param {Query} q
   * @param {AbortOptions} options
   */
  async * query (q, options = {}) {
    yield * this.child.query(q, options)
  }

  /**
   * @param {KeyQuery} q
   * @param {AbortOptions} options
   */
  async * queryKeys (q, options = {}) {
    yield * this.child.queryKeys(q, options)
  }
}

module.exports = BlockStorage
