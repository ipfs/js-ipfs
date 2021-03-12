'use strict'

const errCode = require('err-code')
const IpldBlock = require('ipld-block')
const map = require('it-map')
const { CID } = require('multiformats')

const asLegacyCid = require('ipfs-core-utils/src/as-legacy-cid')

/**
 * @typedef {import('ipfs-core-types/src/bitswap').Bitswap} BitSwap
 * @typedef {import('ipfs-repo')} IPFSRepo
 *
 * @typedef {object} Block
 * @property {Uint8Array} bytes
 * @property {CID} cid
 */

/**
 * BlockService is a hybrid block datastore. It stores data in a local
 * datastore and may retrieve data from a remote Exchange.
 * It uses an internal `datastore.Datastore` instance to store values.
 */
class BlockService {
  /**
   * Create a new BlockService
   *
   * @param {IPFSRepo} ipfsRepo
   */
  constructor (ipfsRepo) {
    this._repo = ipfsRepo
    this._bitswap = null
  }

  /**
   * Add a bitswap instance that communicates with the
   * network to retreive blocks that are not in the local store.
   *
   * If the node is online all requests for blocks first
   * check locally and afterwards ask the network for the blocks.
   *
   * @param {BitSwap} bitswap
   */
  setExchange (bitswap) {
    this._bitswap = bitswap
  }

  /**
   * Go offline, i.e. drop the reference to bitswap.
   */
  unsetExchange () {
    this._bitswap = null
  }

  /**
   * Is the blockservice online, i.e. is bitswap present.
   */
  hasExchange () {
    return this._bitswap !== null
  }

  /**
   * Put a block to the underlying datastore.
   *
   * @param {Block} block
   * @param {object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {Promise<Block>}
   */
  async put (block, options) {
    const legacyBlock = new IpldBlock(block.bytes, asLegacyCid(block.cid))

    if (this._bitswap !== null) {
      await this._bitswap.put(legacyBlock, options)
    } else {
      await this._repo.blocks.put(legacyBlock, options)
    }
    return block
  }

  /**
   * Put a multiple blocks to the underlying datastore.
   *
   * @param {AsyncIterable<Block> | Iterable<Block>} blocks
   * @param {object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {AsyncIterable<Block>}
   */
  putMany (blocks, options) {
    const legacyBlocks = map(blocks, (block) => {
      return new IpldBlock(block.bytes, asLegacyCid(block.cid))
    })

    let result
    if (this._bitswap !== null) {
      result = this._bitswap.putMany(legacyBlocks, options)
    } else {
      result = this._repo.blocks.putMany(legacyBlocks, options)
    }

    return map(result, (legacyBlock) => {
      return {
        cid: CID.decode(legacyBlock.cid.bytes),
        bytes: legacyBlock.data
      }
    })
  }

  /**
   * Get a block by cid.
   *
   * @param {CID} cid
   * @param {object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {Promise<Block>}
   */
  async get (cid, options) {
    const legacyCid = asLegacyCid(cid)

    let legacyBlock
    if (this._bitswap !== null) {
      legacyBlock = await this._bitswap.get(legacyCid, options)
    } else {
      legacyBlock = await this._repo.blocks.get(legacyCid, options)
    }

    return {
      cid: CID.decode(legacyBlock.cid.bytes),
      bytes: legacyBlock.data
    }
  }

  /**
   * Get multiple blocks back from an array of cids.
   *
   * @param {AsyncIterable<CID> | Iterable<CID>} cids
   * @param {object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   * @returns {AsyncIterable<Block>}
   */
  getMany (cids, options) {
    if (!Array.isArray(cids)) {
      throw new Error('first arg must be an array of cids')
    }

    const legacyCids = map(cids, asLegacyCid)

    let result
    if (this._bitswap !== null) {
      result = this._bitswap.getMany(legacyCids, options)
    } else {
      result = this._repo.blocks.getMany(legacyCids, options)
    }

    return map(result, (legacyBlock) => {
      return {
        cid: CID.decode(legacyBlock.cid.bytes),
        bytes: legacyBlock.data
      }
    })
  }

  /**
   * Delete a block from the blockstore.
   *
   * @param {CID} cid
   * @param {object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   */
  async delete (cid, options) {
    const legacyCid = asLegacyCid(cid)

    if (!await this._repo.blocks.has(legacyCid)) {
      throw errCode(new Error('blockstore: block not found'), 'ERR_BLOCK_NOT_FOUND')
    }

    return this._repo.blocks.delete(legacyCid, options)
  }

  /**
   * Delete multiple blocks from the blockstore.
   *
   * @param {AsyncIterable<CID> | Iterable<CID>} cids
   * @param {object} [options] -  Options is an object with the following properties
   * @param {AbortSignal} [options.signal] - A signal that can be used to abort any long-lived operations that are started as a result of this operation
   */
  deleteMany (cids, options) {
    const repo = this._repo

    const existingCids = map(cids, async (cid) => {
        const legacyCid = asLegacyCid(cid)

        if (!await repo.blocks.has(legacyCid)) {
          throw errCode(new Error('blockstore: block not found'), 'ERR_BLOCK_NOT_FOUND')
        }

        return legacyCid
    })

    return this._repo.blocks.deleteMany(existingCids, options)
  }
}

module.exports = BlockService
