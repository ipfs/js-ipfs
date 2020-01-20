'use strict'

const debug = require('debug')
const { cidToString } = require('../utils/cid')
const log = debug('ipfs:mfs-preload')
log.error = debug('ipfs:mfs-preload:error')

module.exports = ({ preload, files, options }) => {
  options = options || {}
  options.interval = options.interval || 30 * 1000

  if (!options.enabled) {
    log('MFS preload disabled')
    const noop = async () => {}
    return { start: noop, stop: noop }
  }

  let rootCid, timeoutId

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
    async start () {
      const stats = await files.stat('/')
      rootCid = cidToString(stats.cid, { base: 'base32' })
      log(`monitoring MFS root ${stats.cid}`)
      timeoutId = setTimeout(preloadMfs, options.interval)
    },
    stop () {
      clearTimeout(timeoutId)
    }
  }
}
