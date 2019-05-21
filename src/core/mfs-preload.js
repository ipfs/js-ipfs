'use strict'

const debug = require('debug')
const setImmediate = require('async/setImmediate')
const log = debug('ipfs:mfs-preload')
log.error = debug('ipfs:mfs-preload:error')

module.exports = (self) => {
  const options = self._options.preload || {}
  options.interval = options.interval || 30 * 1000

  if (!options.enabled) {
    log('MFS preload disabled')
    return {
      start: (cb) => setImmediate(cb),
      stop: (cb) => setImmediate(cb)
    }
  }

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

        return self._preload(stats.hash, (err) => {
          timeoutId = setTimeout(preloadMfs, options.interval)
          if (err) return log.error(`failed to preload MFS root ${stats.hash}`, err)
          rootCid = stats.hash
        })
      }

      timeoutId = setTimeout(preloadMfs, options.interval)
    })
  }

  return {
    start (cb) {
      self.files.stat('/', (err, stats) => {
        if (err) return cb(err)
        rootCid = stats.hash
        log(`monitoring MFS root ${rootCid}`)
        timeoutId = setTimeout(preloadMfs, options.interval)
        cb()
      })
    },
    stop (cb) {
      clearTimeout(timeoutId)
      cb()
    }
  }
}
