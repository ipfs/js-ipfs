import { multiaddrToUri } from '@multiformats/multiaddr-to-uri'
import { logger } from '@libp2p/logger'
import shuffle from 'array-shuffle'
import { preload } from 'ipfs-core-config/preload'
import hashlru from 'hashlru'

const log = logger('ipfs:preload')

/**
 * @param {import('./types').PreloadOptions} [options]
 */
export function createPreloader (options = {}) {
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
  /** @type {AbortController[]} */
  let requests = []
  const apiUris = options.addresses.map((str) => multiaddrToUri(str))

  // Avoid preloading the same CID over and over again
  const cache = hashlru(options.cache)

  /**
   * @type {import('./types').Preload}
   */
  const api = async cid => {
    try {
      if (stopped) {
        throw new Error(`preload ${cid} but preloader is not started`)
      }

      const path = cid.toString()

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
        /** @type {AbortController} */
        let controller

        try {
          controller = new AbortController()
          requests = requests.concat(controller)
          await preload(`${uri}/api/v0/refs?r=true&arg=${encodeURIComponent(path)}`, { signal: controller.signal })
          success = true
        } catch (/** @type {any} */ err) {
          if (err.type !== 'aborted') log.error(err)
        } finally {
          requests = requests.filter(r => r !== controller)
        }

        if (success) break
      }

      log(`${success ? '' : 'un'}successfully preloaded ${path} in ${Date.now() - now}ms`)
    } catch (/** @type {any} */ err) {
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
