'use strict'

const debug = require('debug')
const { cidToString } = require('ipfs-core-utils/src/cid')
const log = Object.assign(debug('ipfs:mfs-preload'), {
  error: debug('ipfs:mfs-preload:error')
})

/**
 * @typedef {PreloadOptions & MFSPreloadOptions} Options
 * @typedef {Object} MFSPreloadOptions
 * @property {number} [interval]
 * @typedef {import('./types').PreloadOptions} PreloadOptions
 */

/**
 * @param {Object} config
 * @param {import('./types').Preload} config.preload
 * @param {import('ipfs-core-types/src/files').API} config.files
 * @param {Options} [config.options]
 */
module.exports = ({ preload, files, options = {} }) => {
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
      const nextRootCid = cidToString(stats.cid, { base: 'base32' })

      if (rootCid !== nextRootCid) {
        log(`preloading updated MFS root ${rootCid} -> ${stats.cid}`)
        await preload(stats.cid)
        rootCid = nextRootCid
      }
    } catch (err) {
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
      rootCid = cidToString(stats.cid, { base: 'base32' })
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
