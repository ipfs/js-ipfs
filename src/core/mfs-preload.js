'use strict'

const debug = require('debug')
const log = debug('ipfs:mfs-preload')
log.error = debug('ipfs:mfs-preload:error')

module.exports = (self) => {
  const options = self._options.preload || {}
  options.interval = options.interval || 30 * 1000

  if (!options.enabled) {
    log('MFS preload disabled')
    return {
      start: async () => {},
      stop: async () => {}
    }
  }

  let rootCid
  let timeoutId

  const preloadMfs = async () => {
    try {
      const stats = await self.files.stat('/')

      if (rootCid !== stats.hash) {
        log(`preloading updated MFS root ${rootCid} -> ${stats.hash}`)
        await self._preload(stats.hash)
        rootCid = stats.hash
      }
    } catch (err) {
      log.error('failed to preload MFS root', err)
    } finally {
      timeoutId = setTimeout(preloadMfs, options.interval)
    }
  }

  return {
    async start () {
      const stats = await self.files.stat('/')
      rootCid = stats.hash
      log(`monitoring MFS root ${rootCid}`)
      timeoutId = setTimeout(preloadMfs, options.interval)
    },
    stop () {
      clearTimeout(timeoutId)
    }
  }
}
