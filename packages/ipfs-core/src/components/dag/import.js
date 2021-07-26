'use strict'

const { CarBlockIterator } = require('@ipld/car/iterator')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const itPeekable = require('it-peekable')
const drain = require('it-drain')
const map = require('it-map')
const log = require('debug')('ipfs:components:dag:import')

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
      const peekable = itPeekable(sources)

      const { value, done } = await peekable.peek()

      if (done) {
        return
      }

      if (value) {
        peekable.push(value)
      }

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
        const roots = await importCar(repo, abortOptions, car)

        if (options.pinRoots !== false) { // default=true
          for (const cid of roots) {
            let pinErrorMsg = ''

            try { // eslint-disable-line max-depth
              if (await repo.blocks.has(cid)) { // eslint-disable-line max-depth
                log(`Pinning root ${cid}`)
                await repo.pins.pinRecursively(cid)
              } else {
                pinErrorMsg = 'blockstore: block not found'
              }
            } catch (err) {
              pinErrorMsg = err.message
            }

            yield { root: { cid, pinErrorMsg } }
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

  await drain(
    repo.blocks.putMany(
      map(reader, ({ cid: key, bytes: value }) => {
        log(`Import block ${key}`)

        return { key, value }
      }),
      { signal: options.signal }
    )
  )

  return roots
}
