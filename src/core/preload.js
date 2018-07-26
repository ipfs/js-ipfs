'use strict'

const setImmediate = require('async/setImmediate')
const retry = require('async/retry')
const toUri = require('multiaddr-to-uri')
const debug = require('debug')
const CID = require('cids')
const shuffle = require('lodash/shuffle')
const preload = require('./runtime/preload-nodejs')

const log = debug('jsipfs:preload')
log.error = debug('jsipfs:preload:error')

const noop = (err) => { if (err) log.error(err) }

module.exports = self => {
  const options = self._options.preload || {}
  options.enabled = Boolean(options.enabled)
  options.addresses = options.addresses || []

  if (!options.enabled || !options.addresses.length) {
    return (_, callback) => {
      if (callback) {
        setImmediate(() => callback())
      }
    }
  }

  let requests = []
  const apiUris = options.addresses.map(apiAddrToUri)

  const api = (cid, callback) => {
    callback = callback || noop

    if (typeof cid !== 'string') {
      try {
        cid = new CID(cid).toBaseEncodedString()
      } catch (err) {
        return setImmediate(() => callback(err))
      }
    }

    const shuffledApiUris = shuffle(apiUris)
    let request

    retry({ times: shuffledApiUris.length }, (cb) => {
      if (self.state.state() === 'stopped') return cb()

      // Remove failed request from a previous attempt
      requests = requests.filter(r => r !== request)

      const apiUri = shuffledApiUris.pop()

      request = preload(`${apiUri}/api/v0/refs?r=true&arg=${cid}`, cb)
      requests = requests.concat(request)
    }, (err) => {
      requests = requests.filter(r => r !== request)

      if (err) {
        return callback(err)
      }

      callback()
    })
  }

  api.start = () => {}

  api.stop = () => {
    log(`canceling ${requests.length} pending preload requests`)
    requests.forEach(r => r.cancel())
    requests = []
  }

  return api
}

function apiAddrToUri (addr) {
  if (!(addr.endsWith('http') || addr.endsWith('https'))) {
    addr = addr + '/http'
  }
  return toUri(addr)
}
