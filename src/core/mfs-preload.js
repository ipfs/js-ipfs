'use strict'

const debug = require('debug')

const log = debug('jsipfs:mfs-preload')
log.error = debug('jsipfs:mfs-preload:error')

module.exports = (self, options) => {
  options = options || {}
  options.interval = options.interval || 30 * 1000

  let rootCid
  let timeoutId

  const preloadMfs = () => {
    self.files.stat('/', (err, stats) => {
      if (err) {
        timeoutId = setTimeout(preloadMfs, options.interval)
        return log.error('failed to stat MFS root for preload', err)
      }

      if (rootCid !== stats.hash) {
        log(`preloading updated MFS root ${rootCid} -> ${stats.hash}`)

        self._preload(stats.hash, (err) => {
          timeoutId = setTimeout(preloadMfs, options.interval)
          if (err) return log.error(`failed to preload MFS root ${stats.hash}`, err)
          rootCid = stats.hash
        })
      }
    })
  }

  return {
    start () {
      self.files.stat('/', (err, stats) => {
        if (err) return log.error('failed to stat MFS root for preload', err)
        rootCid = stats.hash
        log(`monitoring MFS root ${rootCid}`)
        timeoutId = setTimeout(preloadMfs, options.interval)
      })
    },
    stop () {
      clearTimeout(timeoutId)
    }
  }
}
