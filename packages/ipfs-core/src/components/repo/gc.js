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
 * Perform mark and sweep garbage collection
 *
 * @param {Object} config
 * @param {import('.').GCLock} config.gcLock
 * @param {import('.').Pin} config.pin
 * @param {import('.').Refs} config.refs
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ gcLock, pin, refs, repo }) => {
  /**
   * @param {AbortOptions} [_options]
   * @returns {AsyncIterable<Notification>}
   */
  async function * gc (_options = {}) {
    const start = Date.now()
    log('Creating set of marked blocks')

    const release = await gcLock.writeLock()

    try {
      // Mark all blocks that are being used
      const markedSet = await createMarkedSet({ pin, refs, repo })
      // Get all blocks keys from the blockstore
      // @ts-ignore - TS is not aware of keysOnly overload
      const blockKeys = repo.blocks.query({ keysOnly: true })

      // Delete blocks that are not being used
      yield * deleteUnmarkedBlocks({ repo }, markedSet, blockKeys)

      log(`Complete (${Date.now() - start}ms)`)
    } finally {
      release()
    }
  }

  return withTimeoutOption(gc)
}

// Get Set of CIDs of blocks to keep
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

// Delete all blocks that are not marked as in use
async function * deleteUnmarkedBlocks ({ repo }, markedSet, blockKeys) {
  // Iterate through all blocks and find those that are not in the marked set
  // blockKeys yields { key: Key() }
  let blocksCount = 0
  let removedBlocksCount = 0

  const removeBlock = async (cid) => {
    blocksCount++

    try {
      const b32 = multibase.encode('base32', cid.multihash).toString()
      if (markedSet.has(b32)) return null
      const res = { cid }

      try {
        await repo.blocks.delete(cid)
        removedBlocksCount++
      } catch (err) {
        res.err = new Error(`Could not delete block with CID ${cid}: ${err.message}`)
      }

      return res
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

/**
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 *
 * @typedef {Err|BlockID} Notification
 *
 * @typedef {Object} Err
 * @property {void} [cid]
 * @property {Error} err
 *
 * @typedef {Object} BlockID
 * @property {CID} cid
 * @property {void} [err]
 *
 * @typedef {import('interface-datastore').Key} Key
 */
