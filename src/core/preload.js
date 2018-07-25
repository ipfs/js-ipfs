'use strict'

const setImmediate = require('async/setImmediate')
const each = require('async/each')
const toUri = require('multiaddr-to-uri')
const debug = require('debug')
const preload = require('./runtime/preload-nodejs')

const log = debug('jsipfs:preload')
log.error = debug('jsipfs:preload:error')

// Tools like IPFS Companion redirect requests to IPFS gateways to your local
// gateway. This is a hint to those tools that they shouldn't redirect these
// requests as they will effectively disable the preloading.
const redirectOptOutHint = 'x-ipfs-preload'

module.exports = (options) => {
  options = options || {}
  options.enabled = !!options.enabled
  options.gateways = options.gateways || []

  if (!options.enabled || !options.gateways.length) {
    return (_, callback) => {
      if (callback) {
        setImmediate(() => callback())
      }
    }
  }

  const noop = (err) => {
    if (err) log.error(err)
  }

  return (cid, callback) => {
    callback = callback || noop

    each(options.gateways, (gatewayAddr, cb) => {
      let gatewayUri

      try {
        gatewayUri = toUri(gatewayAddr)
        gatewayUri = gatewayUri.startsWith('http') ? gatewayUri : `http://${gatewayUri}`
      } catch (err) {
        return cb(err)
      }

      const url = `${gatewayUri}/ipfs/${cid.toBaseEncodedString()}#${redirectOptOutHint}`
      preload(url, cb)
    }, callback)
  }
}
