'use strict'

const toUri = require('multiaddr-to-uri')
const debug = require('debug')
const CID = require('cids')
const shuffle = require('array-shuffle')
const { AbortController } = require('native-abort-controller')
const preload = require('./runtime/preload-nodejs')
/** @type {typeof import('hashlru').default} */
// @ts-ignore - hashlru has incorrect typedefs
const hashlru = require('hashlru')

const log = Object.assign(
  debug('ipfs:preload'),
  { error: debug('ipfs:preload:error') }
)

/**
 * @param {Options & AbortOptions} [options]
 */
const createPreloader = (options = {}) => {
  options.enabled = Boolean(options.enabled)
  options.addresses = options.addresses || []
  options.cache = options.cache || 1000

  if (!options.enabled || !options.addresses.length) {
    log('preload disabled')
    const api = () => {}
    return Object.assign(api, {
      start: () => {},
      stop: () => {}
    })
  }

  let stopped = true
  let requests = []
  const apiUris = options.addresses.map(toUri)

  // Avoid preloading the same CID over and over again
  const cache = hashlru(options.cache)

  /**
   * @param {string|CID} path
   * @returns {Promise<void>}
   */
  const api = async path => {
    try {
      if (stopped) throw new Error(`preload ${path} but preloader is not started`)

      if (typeof path !== 'string') {
        path = new CID(path).toString()
      }

      if (cache.has(path)) {
        // we've preloaded this recently, don't preload it again
        return
      }

      // make sure we don't preload this again any time soon
      cache.set(path, true)

      const fallbackApiUris = shuffle(apiUris)
      let success = false
      const now = Date.now()

      for (const uri of fallbackApiUris) {
        if (stopped) throw new Error(`preload aborted for ${path}`)
        let controller

        try {
          controller = new AbortController()
          requests = requests.concat(controller)
          await preload(`${uri}/api/v0/refs?r=true&arg=${encodeURIComponent(path)}`, { signal: controller.signal })
          success = true
        } catch (err) {
          if (err.type !== 'aborted') log.error(err)
        } finally {
          requests = requests.filter(r => r !== controller)
        }

        if (success) break
      }

      log(`${success ? '' : 'un'}successfully preloaded ${path} in ${Date.now() - now}ms`)
    } catch (err) {
      log.error(err)
    }
  }

  /**
   * @returns {void}
   */
  api.start = () => {
    stopped = false
  }

  /**
   * @returns {void}
   */
  api.stop = () => {
    stopped = true
    log(`aborting ${requests.length} pending preload request(s)`)
    requests.forEach(r => r.abort())
    requests = []
  }

  return api
}

module.exports = createPreloader

/**
 * @typedef {ReturnType<typeof createPreloader>} Preload
 *
 * @typedef {object} Options
 * @property {boolean} [enabled = false] - Whether to preload anything
 * @property {number} [cache = 1000] - How many CIDs to cache
 * @property {string[]} [addresses = []] - Which preload servers to use.
 * **NOTE:** nodes specified here should also be added to your node's bootstrap address list at `config.Boostrap`.
 *
 * @typedef {import('./components').AbortOptions} AbortOptions
 */
