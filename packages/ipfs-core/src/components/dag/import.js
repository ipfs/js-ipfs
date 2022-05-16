import { CarBlockIterator } from '@ipld/car/iterator'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import itPeekable from 'it-peekable'
import drain from 'it-drain'
import map from 'it-map'
import { logger } from '@libp2p/logger'
const log = logger('ipfs:components:dag:import')

/**
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/dag/').ImportRootStatus} RootStatus
 */

/**
 * @param {object} config
 * @param {IPFSRepo} config.repo
 */
export function createImport ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/dag').API<{}>["import"]}
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
        // @ts-expect-error
        peekable.push(value)
      }

      /**
       * @type {AsyncIterable<AsyncIterable<Uint8Array>> | Iterable<AsyncIterable<Uint8Array>>}
       */
      let cars

      if (value instanceof Uint8Array) {
        // @ts-expect-error
        cars = [peekable]
      } else {
        // @ts-expect-error
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
            } catch (/** @type {any} */ err) {
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
