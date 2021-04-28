'use strict'

const CID = require('cids')
const log = require('debug')('ipfs:repo:gc')
const { MFS_ROOT_KEY } = require('../../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code
const { parallelMerge, transform, map } = require('streaming-iterables')
const multibase = require('multibase')

// Limit on the number of parallel block remove operations
const BLOCK_RM_CONCURRENCY = 256

/**
 * @typedef {import('ipfs-core-types/src/pin').API} PinAPI
 * @typedef {import('ipfs-core-types/src/refs').API} RefsAPI
 * @typedef {import('ipfs-repo')} IPFSRepo
 * @typedef {import('interface-datastore').Key} Key
 * @typedef {import('ipld-block')} Block
 */

/**
 * Perform mark and sweep garbage collection
 *
 * @param {Object} config
 * @param {import('../gc-lock').GCLock} config.gcLock
 * @param {PinAPI} config.pin
 * @param {RefsAPI["refs"]} config.refs
 * @param {IPFSRepo} config.repo
 */
module.exports = ({ gcLock, pin, refs, repo }) => {
  /**
   * @type {import('ipfs-core-types/src/repo').API["gc"]}
   */
  async function * gc (_options = {}) {
    const start = Date.now()
    log('Creating set of marked blocks')

    const release = await gcLock.writeLock()

    try {
      // Mark all blocks that are being used
      const markedSet = await createMarkedSet({ pin, refs, repo })
      // Get all blocks keys from the blockstore
      const blockKeys = repo.blocks.queryKeys({})

      // Delete blocks that are not being used
      yield * deleteUnmarkedBlocks({ repo }, markedSet, blockKeys)

      log(`Complete (${Date.now() - start}ms)`)
    } finally {
      release()
    }
  }

  return withTimeoutOption(gc)
}

/**
 * Get Set of CIDs of blocks to keep
 *
 * @param {object} arg
 * @param {PinAPI} arg.pin
 * @param {RefsAPI["refs"]} arg.refs
 * @param {IPFSRepo} arg.repo
 */
async function createMarkedSet ({ pin, refs, repo }) {
  const pinsSource = map(({ cid }) => cid, pin.ls())

  const mfsSource = (async function * () {
    let mh
    try {
      mh = await repo.root.get(MFS_ROOT_KEY)
    } catch (err) {
      if (err.code === ERR_NOT_FOUND) {
        log('No blocks in MFS')
        return
      }
      throw err
    }

    const rootCid = new CID(mh)
    yield rootCid

    for await (const { ref } of refs(rootCid, { recursive: true })) {
      yield new CID(ref)
    }
  })()

  const output = new Set()
  for await (const cid of parallelMerge(pinsSource, mfsSource)) {
    output.add(multibase.encode('base32', cid.multihash).toString())
  }
  return output
}

/**
 * Delete all blocks that are not marked as in use
 *
 * @param {object} arg
 * @param {IPFSRepo} arg.repo
 * @param {Set<string>} markedSet
 * @param {AsyncIterable<CID>} blockKeys
 */
async function * deleteUnmarkedBlocks ({ repo }, markedSet, blockKeys) {
  // Iterate through all blocks and find those that are not in the marked set
  // blockKeys yields { key: Key() }
  let blocksCount = 0
  let removedBlocksCount = 0

  /**
   * @param {CID} cid
   */
  const removeBlock = async (cid) => {
    blocksCount++

    try {
      const b32 = multibase.encode('base32', cid.multihash).toString()

      if (markedSet.has(b32)) {
        return null
      }

      try {
        await repo.blocks.delete(cid)
        removedBlocksCount++
      } catch (err) {
        return {
          err: new Error(`Could not delete block with CID ${cid}: ${err.message}`)
        }
      }

      return { cid }
    } catch (err) {
      const msg = `Could delete block with CID ${cid}`
      log(msg, err)
      return { err: new Error(msg + `: ${err.message}`) }
    }
  }

  for await (const res of transform(BLOCK_RM_CONCURRENCY, removeBlock, blockKeys)) {
    // filter nulls (blocks that were retained)
    if (res) yield res
  }

  log(`Marked set has ${markedSet.size} unique blocks. Blockstore has ${blocksCount} blocks. ` +
  `Deleted ${removedBlocksCount} blocks.`)
}
