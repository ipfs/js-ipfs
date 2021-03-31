'use strict'

const errCode = require('err-code')
const map = require('it-map')
const { parallelMap, filter } = require('streaming-iterables')
const { CID } = require('multiformats/cid')
const { pipe } = require('it-pipe')
const { PinTypes } = require('./components/pin/pin-manager')
const IpldBlock = require('ipld-block')
const LegacyCID = require('cids')

const asLegacyCid = require('ipfs-core-utils/src/as-legacy-cid')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

const BLOCK_RM_CONCURRENCY = 8

/**
 * @typedef {import('./types').Preload} Preload
 * @typedef {import('ipfs-block-service')} BlockService
 * @typedef {import('./components/gc-lock').GCLock} GCLock
 * @typedef {import('ipfs-core-types/src/pin').API} Pin
 * @typedef {import('./components/pin/pin-manager')} PinManager
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/utils').PreloadOptions} PreloadOptions
 *
 * @typedef {import('ipfs-core-types/src/block').RmOptions} RmOptions
 *
 * @typedef {import('ipfs-bitswap')} Bitswap
 * @typedef {import('ipfs-repo')} IPFSRepo
 *
 * @typedef {object} Block
 * @property {Uint8Array} bytes
 * @property {CID} cid
 */

/**
 * BlockStorage is a hybrid block datastore. It stores data in a local
 * datastore and may retrieve data from a remote Exchange.
 * It uses an internal `datastore.Datastore` instance to store values.
 */
class BlockStorage {
  /**
   * Create a new BlockStorage
   *
   * @param {Object} config
   * @param {IPFSRepo} config.repo
   * @param {Preload} config.preload
   * @param {GCLock} config.gcLock
   * @param {PinManager} config.pinManager
   * @param {Pin} config.pin
   */
  constructor ({ repo, preload, gcLock, pinManager, pin }) {
    // Bitswap is enabled/disable after construction
    this._bitswap = null

    // `self` is needed as bitswap access is global mutable state
    const self = this
    this.get = createGet({ self, repo, preload })
    this.getMany = createGetMany({ self, repo})
    this.put = createPut({ self, repo, preload, gcLock, pin })
    this.deleteMany = createDeleteMany({ repo, gcLock, pinManager })
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
}

/**
 * @param {Object} config
 * @param {BlockStorage} config.self
 * @param {IPFSRepo} config.repo
 * @param {Preload} config.preload
 */
const createGet = ({ self, repo, preload }) => {
  /**
   * Get a block by cid.
   *
   * @param {CID} cid
   * @param {AbortOptions & PreloadOptions} [options]
   * @returns A block
   */
  const get = async (cid, options = {}) => {
    const legacyCid = asLegacyCid(cid)

    if (options.preload) {
      // TODO vmx 2021-03-17: double-check if preload needs a new or a legacy CID
      preload(cid)
    }

    let legacyBlock
    if (self._bitswap !== null) {
      legacyBlock = await self._bitswap.get(legacyCid, {
        signal: options.signal
      })
    } else {
      legacyBlock = await repo.blocks.get(legacyCid, {
        signal: options.signal
      })
    }

    return {
      cid: CID.decode(legacyBlock.cid.bytes),
      bytes: legacyBlock.data
    }
  }

  return withTimeoutOption(get)
}

/**
 * @param {Object} config
 * @param {BlockStorage} config.self
 * @param {IPFSRepo} config.repo
 */
const createGetMany = ({ self, repo }) => {
  /**
   * Get multiple blocks back from an array of cids.
   *
   * @param {AsyncIterable<CID> | Iterable<CID>} cids
   * @param {AbortOptions & PreloadOptions} [options]
   * @returns List of blocks
   */
  const getMany = async function * (cids, options = {}) {
    const legacyCids = map(cids, asLegacyCid)

    // TODO vmx 2021-03-19: Is preload() needed for `getMany()`? It only seems to be used in non preload cases
    if (options.preload) {
      throw new Error("TODO vmx 2021-03-19: Is preload needed for getMany?")
    }

    let result
    if (self._bitswap !== null) {
      result = self._bitswap.getMany(legacyCids, {
        signal: options.signal
      })
    } else {
      result = repo.blocks.getMany(legacyCids, {
        signal: options.signal
      })
    }

    yield * map(result, (legacyBlock) => {
      return {
        cid: CID.decode(legacyBlock.cid.bytes),
        bytes: legacyBlock.data
      }
    })
  }

  return withTimeoutOption(getMany)
}

/**
 * @param {Object} config
 * @param {BlockStorage} config.self
 * @param {IPFSRepo} config.repo
 * @param {Preload} config.preload
 * @param {GCLock} config.gcLock
 * @param {Pin} config.pin
 */
const createPut = ({ self, repo, preload, gcLock, pin }) => {
  /**
   * Put a block to the underlying datastore.
   *
   * @param {Block} block
   * @param {AbortOptions & PreloadOptions & { pin?: boolean}} [options]
   * @returns The block that was put
   */
  const put = async (block, options = {}) => {
    const legacyBlock = new IpldBlock(block.bytes, asLegacyCid(block.cid))

    const release = await gcLock.readLock()

    try {
      if (self._bitswap !== null) {
        await self._bitswap.put(legacyBlock, {
          signal: options.signal
        })
      } else {
        await repo.blocks.put(legacyBlock, {
          signal: options.signal
        })
      }

      if (options.preload) {
        // TODO vmx 2021-03-17: double-check if preload needs a new or a legacy CID
        preload(block.cid)
      }

      if (options.pin === true) {
        await pin.add(legacyBlock.cid, {
          recursive: true,
          signal: options.signal
        })
      }

      return block
    } finally {
      release()
    }
  }

  return withTimeoutOption(put)
}


/**
 * @param {Object} config
 * @param {IPFSRepo} config.repo
 * @param {GCLock} config.gcLock
 * @param {PinManager} config.pinManager
 */
const createDeleteMany = ({ repo, gcLock, pinManager }) => {
  /**
   * Delete multiple blocks from the blockstore.
   *
   * @param {AsyncIterable<CID> | Iterable<CID>} cids
   * @param {RmOptions} [options]
   * @returns List of deleted CIDs
   */
  const deleteMany = async function * (cids, options = {}) {
    // We need to take a write lock here to ensure that adding and removing
    // blocks are exclusive operations
    const release = await gcLock.writeLock()

    try {
      yield * pipe(
        // TODO vmx 2021-03-17: Check if it suppports an iterator as input
        cids,
        parallelMap(BLOCK_RM_CONCURRENCY, async cid => {
          const legacyCid = asLegacyCid(cid)

          /** @type {{ cid: CID, error?: Error }} */
          const result = { cid }

          try {
            const pinResult = await pinManager.isPinnedWithType(legacyCid, PinTypes.all)

            if (pinResult.pinned) {
              if (LegacyCID.isCID(pinResult.reason)) { // eslint-disable-line max-depth
                throw errCode(new Error(`pinned via ${pinResult.reason}`), 'ERR_BLOCK_PINNED')
              }

              throw errCode(new Error(`pinned: ${pinResult.reason}`), 'ERRO_BLOCK_PINNED')
            }

            // remove has check when https://github.com/ipfs/js-ipfs-block-service/pull/88 is merged
            // @ts-ignore - this accesses some internals
            const has = await repo.blocks.has(legacyCid)

            if (!has) {
              throw errCode(new Error('block not found'), 'ERR_BLOCK_NOT_FOUND')
            }

            await repo.blocks.delete(legacyCid)
          } catch (err) {
            if (!options.force) {
              err.message = `cannot remove ${legacyCid}: ${err.message}`
              result.error = err
            }
          }

          return result
        }),
        filter(() => !options.quiet)
      )
    } finally {
      release()
    }
  }

  return withTimeoutOption(deleteMany)
}

module.exports = BlockStorage
