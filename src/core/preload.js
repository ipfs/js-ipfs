const get = require('lodash/get')
const setImmediate = require('async/setImmediate')
const each = require('async/each')
const toUri = require('multiaddr-to-uri')
const preload = require('./runtime/preload-nodejs')

// Tools like IPFS Companion redirect requests to IPFS gateways to your local
// gateway. This is a hint to those tools that they shouldn't redirect these
// requests as they will effectively disable the preloading.
const redirectOptOutHint = 'x-ipfs-preload'

module.exports = self => {
  const enabled = get(self._options, 'preload.enabled')
  const gateways = get(self._options, 'preload.addresses', [])
    .map(address => address.gateway)
    .filter(Boolean)

  if (!enabled || !gateways.length) {
    return (_, callback) => {
      if (!callback) return
      setImmediate(() => callback())
    }
  }

  return (cid, callback) => {
    each(gateways, (gatewayAddr, cb) => {
      let gatewayUri

      try {
        gatewayUri = toUri(gatewayAddr)
      } catch (err) {
        return cb(err)
      }

      const preloadUrl = `${gatewayUri}/ipfs/${cid.toBaseEncodedString()}#${redirectOptOutHint}`

      preload(preloadUrl, cb)
    }, callback)
  }
}
