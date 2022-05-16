import { logger } from '@libp2p/logger'

const log = logger('ipfs:mfs-preload')

/**
 * @typedef {PreloadOptions & MFSPreloadOptions} Options
 * @typedef {object} MFSPreloadOptions
 * @property {number} [interval]
 * @typedef {import('./types').PreloadOptions} PreloadOptions
 */

/**
 * @param {object} config
 * @param {import('./types').Preload} config.preload
 * @param {import('ipfs-core-types/src/files').API} config.files
 * @param {Options} [config.options]
 */
export function createMfsPreloader ({ preload, files, options = {} }) {
  options.interval = options.interval || 30 * 1000

  if (!options.enabled) {
    log('MFS preload disabled')
    const noop = async () => {}
    return { start: noop, stop: noop }
  }

  let rootCid = ''
  /** @type {any} */
  let timeoutId

  const preloadMfs = async () => {
    try {
      const stats = await files.stat('/')
      const nextRootCid = stats.cid.toString()

      if (rootCid !== nextRootCid) {
        log(`preloading updated MFS root ${rootCid} -> ${stats.cid}`)
        await preload(stats.cid)
        rootCid = nextRootCid
      }
    } catch (/** @type {any} */ err) {
      log.error('failed to preload MFS root', err)
    } finally {
      timeoutId = setTimeout(preloadMfs, options.interval)
    }
  }

  return {
    /**
     * @returns {Promise<void>}
     */
    async start () {
      const stats = await files.stat('/')
      rootCid = stats.cid.toString()
      log(`monitoring MFS root ${stats.cid}`)
      timeoutId = setTimeout(preloadMfs, options.interval)
    },
    /**
     * @returns {void}
     */
    stop () {
      clearTimeout(timeoutId)
    }
  }
}
