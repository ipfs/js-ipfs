'use strict'

const { CarBlockIterator } = require('@ipld/car/iterator')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/dag/').ImportRootStatus} RootStatus
 * @typedef {{roots: CID[], blockCount: number}} ImportResponse
 */

/**
 * @param {Object} config
 * @param {IPFSRepo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["import"]}
   */
  async function * dagImport (sources, options = {}) {
    const release = await repo.gcLock.readLock()

    try {
      const abortOptions = { signal: options.signal, timeout: options.timeout }
      /** @type {Promise<ImportResponse>[]}} */
      const importers = []

      for await (const source of sources) {
        importers.push(importCar(repo, abortOptions, source))
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
            await repo.pins.pinRecursively(cid)
            yield { root: { cid, pinErrorMsg: '' } }
          } catch (err) {
            yield { root: { cid, pinErrorMsg: err.message } }
          }
        }
      }
    } finally {
      release()
    }
  }

  return withTimeoutOption(dagImport)
}

/**
 * @param {IPFSRepo} repo
 * @param {AbortOptions} options
 * @param {AsyncIterable<Uint8Array>} source
 * @returns {Promise<ImportResponse>}
 */
async function importCar (repo, options, source) {
  const reader = await CarBlockIterator.fromIterable(source)
  // keep track of whether the root(s) exist within the CAR or not for later reporting & pinning
  let blockCount = 0
  const roots = await reader.getRoots()

  for await (const { cid, bytes } of reader) {
    // TODO: would there be any benefit to queueing up these put() to allow them
    // to work in parallel while we parse the incoming stream?
    await repo.blocks.put(cid, bytes, { signal: options.signal })

    blockCount++
  }
  return { roots, blockCount }
}
