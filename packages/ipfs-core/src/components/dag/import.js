'use strict'

const { CarBlockIterator } = require('@ipld/car/iterator')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const itPeekable = require('it-peekable')

/**
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/dag/').ImportRootStatus} RootStatus
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
      /** @type {Promise<CID[]>[]}} */
      const importers = []

      const peekable = itPeekable(sources)
      /** @type {any} value **/
      const { value, done } = await peekable.peek()

      if (done) {
        return
      }

      peekable.push(value)

      /**
       * @type {AsyncIterable<AsyncIterable<Uint8Array>> | Iterable<AsyncIterable<Uint8Array>>}
       */
      let cars

      if (value instanceof Uint8Array) {
        // @ts-ignore
        cars = [peekable]
      } else {
        cars = peekable
      }

      for await (const car of cars) {
        importers.push(importCar(repo, abortOptions, car))
      }

      const results = await Promise.all(importers)
      const roots = results.reduce((accum, roots) => {
        return accum.concat(roots)
      }, [])

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
 * @returns {Promise<CID[]>}
 */
async function importCar (repo, options, source) {
  const reader = await CarBlockIterator.fromIterable(source)
  const roots = await reader.getRoots()

  for await (const { cid, bytes } of reader) {
    // TODO: would there be any benefit to queueing up these put() to allow them
    // to work in parallel while we parse the incoming stream?
    await repo.blocks.put(cid, bytes, { signal: options.signal })
  }

  return roots
}
