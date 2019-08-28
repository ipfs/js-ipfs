'use strict'

const setImmediate = require('async/setImmediate')
const retry = require('async/retry')
const toUri = require('multiaddr-to-uri')
const debug = require('debug')
const CID = require('cids')
const shuffle = require('array-shuffle')
const preload = require('./runtime/preload-nodejs')

const log = debug('ipfs:preload')
log.error = debug('ipfs:preload:error')

const noop = (err) => { if (err) log.error(err) }

module.exports = self => {
  const options = self._options.preload || {}
  options.enabled = Boolean(options.enabled)
  options.addresses = options.addresses || []

  if (!options.enabled || !options.addresses.length) {
    log('preload disabled')
    const api = (_, callback) => {
      if (callback) {
        setImmediate(() => callback())
      }
    }
    api.start = () => {}
    api.stop = () => {}
    return api
  }

  let stopped = true
  let requests = []
  const apiUris = options.addresses.map(toUri)

  const api = (path, callback) => {
    callback = callback || noop

    if (typeof path !== 'string') {
      try {
        path = new CID(path).toBaseEncodedString()
      } catch (err) {
        return setImmediate(() => callback(err))
      }
    }

    const fallbackApiUris = shuffle(apiUris)
    let request
    const now = Date.now()

    retry({ times: fallbackApiUris.length }, (cb) => {
      if (stopped) return cb(new Error(`preload aborted for ${path}`))

      // Remove failed request from a previous attempt
      requests = requests.filter(r => r !== request)

      const apiUri = fallbackApiUris.shift()

      request = preload(`${apiUri}/api/v0/refs?r=true&arg=${encodeURIComponent(path)}`, cb)
      requests = requests.concat(request)
    }, (err) => {
      requests = requests.filter(r => r !== request)

      if (err) {
        return callback(err)
      }

      log(`preloaded ${path} in ${Date.now() - now}ms`)
      callback()
    })
  }

  api.start = () => {
    stopped = false
  }

  api.stop = () => {
    stopped = true
    log(`canceling ${requests.length} pending preload request(s)`)
    requests.forEach(r => r.cancel())
    requests = []
  }

  return api
}
