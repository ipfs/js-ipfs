'use strict'

const { CarBlockIterator } = require('@ipld/car/iterator')
const Block = require('ipld-block')
const CID = require('cids')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('ipfs-block-service')} BlockService
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/dag/').ImportRootStatus} RootStatus
 * @typedef {import('../block').Preload} Preload
 * @typedef {import('../block').GCLock} GCLock
 * @typedef {import('ipfs-core-types/src/pin').API} Pin
 * @typedef {{roots: CID[], blockCount: number}} ImportResponse
 */

/**
 * @param {Object} config
 * @param {BlockService} config.blockService
 * @param {GCLock} config.gcLock
 * @param {Pin} config.pin
 */
module.exports = ({ blockService, gcLock, pin }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["import"]}
   */
  async function * dagImport (sources, options = {}) {
    // TODO: const release = await gcLock.readLock()
    const abortOptions = { signal: options.signal, timeout: options.timeout }
    /** @type {Promise<ImportResponse>[]}} */
    const importers = []
    for await (const source of sources) {
      importers.push(importCar(blockService, abortOptions, source))
    }
    const results = await Promise.all(importers)
    const { blockCount, roots } = results.reduce((accum, { blockCount, roots }) => {
      accum.blockCount += blockCount
      accum.roots = accum.roots.concat(roots)
      return accum
    }, { blockCount: 0, roots: /** @type {CID} */ [] })

    yield { blockCount }

    if (options.pinRoots !== false) { // default=true
      for (const cid of roots) {
        try {
          await pin.add(cid, { recursive: true })
          yield { root: { cid, pinErrorMsg: '' } }
        } catch (err) {
          yield { root: { cid, pinErrorMsg: err.message } }
        }
      }
    }
  }

  return withTimeoutOption(dagImport)
}

/**
 * @param {BlockService} blockService
 * @param {AbortOptions} options
 * @param {AsyncIterable<Uint8Array>} source
 * @returns {Promise<ImportResponse>}
 */
async function importCar (blockService, options, source) {
  const reader = await CarBlockIterator.fromIterable(source)
  // keep track of whether the root(s) exist within the CAR or not for later reporting & pinning
  let blockCount = 0
  const roots = (await reader.getRoots()).map((root) => new CID(root.bytes))
  for await (const { cid, bytes } of reader) {
    const block = new Block(bytes, new CID(cid.bytes))
    // TODO: would there be any benefit to queueing up these put() to allow them
    // to work in parallel while we parse the incoming stream?
    await blockService.put(block, { signal: options.signal })
    blockCount++
  }
  return { roots, blockCount }
}
