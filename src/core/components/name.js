'use strict'

const debug = require('debug')
const promisify = require('promisify-es6')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const human = require('human-to-milliseconds')
const crypto = require('libp2p-crypto')
const errcode = require('err-code')

const log = debug('ipfs:name')
log.error = debug('ipfs:name:error')

const namePubsub = require('./name-pubsub')
const utils = require('../utils')
const path = require('../ipns/path')

const keyLookup = (ipfsNode, kname, callback) => {
  if (kname === 'self') {
    return callback(null, ipfsNode._peerInfo.id.privKey)
  }

  const pass = ipfsNode._options.pass

  waterfall([
    (cb) => ipfsNode._keychain.exportKey(kname, pass, cb),
    (pem, cb) => crypto.keys.import(pem, pass, cb)
  ], (err, privateKey) => {
    if (err) {
      log.error(err)
      return callback(errcode(err, 'ERR_CANNOT_GET_KEY'))
    }

    return callback(null, privateKey)
  })
}

module.exports = function name (self) {
  return {
    /**
     * IPNS is a PKI namespace, where names are the hashes of public keys, and
     * the private key enables publishing new (signed) values. In both publish
     * and resolve, the default name used is the node's own PeerID,
     * which is the hash of its public key.
     *
     * @param {String} value ipfs path of the object to be published.
     * @param {Object} options ipfs publish options.
     * @param {boolean} options.resolve resolve given path before publishing.
     * @param {String} options.lifetime time duration that the record will be valid for.
    This accepts durations such as "300s", "1.5h" or "2h45m". Valid time units are
    "ns", "ms", "s", "m", "h". Default is 24h.
     * @param {String} options.ttl time duration this record should be cached for (NOT IMPLEMENTED YET).
     * This accepts durations such as "300s", "1.5h" or "2h45m". Valid time units are
     "ns", "ms", "s", "m", "h" (caution: experimental).
     * @param {String} options.key name of the key to be used, as listed by 'ipfs key list -l'.
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    publish: promisify((value, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}
      const resolve = !(options.resolve === false)
      const lifetime = options.lifetime || '24h'
      const key = options.key || 'self'

      if (!self.isOnline()) {
        const errMsg = utils.OFFLINE_ERROR

        log.error(errMsg)
        return callback(errcode(errMsg, 'OFFLINE_ERROR'))
      }

      // TODO: params related logic should be in the core implementation

      // Normalize path value
      try {
        value = utils.normalizePath(value)
      } catch (err) {
        log.error(err)
        return callback(err)
      }

      parallel([
        (cb) => human(lifetime, cb),
        // (cb) => ttl ? human(ttl, cb) : cb(),
        (cb) => keyLookup(self, key, cb),
        // verify if the path exists, if not, an error will stop the execution
        (cb) => resolve.toString() === 'true' ? path.resolvePath(self, value, cb) : cb()
      ], (err, results) => {
        if (err) {
          log.error(err)
          return callback(err)
        }

        // Calculate lifetime with nanoseconds precision
        const pubLifetime = results[0].toFixed(6)
        const privateKey = results[1]

        // TODO IMPROVEMENT - Handle ttl for cache
        // const ttl = results[1]
        // const privateKey = results[2]

        // Start publishing process
        self._ipns.publish(privateKey, value, pubLifetime, callback)
      })
    }),

    /**
     * Given a key, query the DHT for its best value.
     *
     * @param {String} name ipns name to resolve. Defaults to your node's peerID.
     * @param {Object} options ipfs resolve options.
     * @param {boolean} options.nocache do not use cached entries.
     * @param {boolean} options.recursive resolve until the result is not an IPNS name.
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    resolve: promisify((name, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}
      const nocache = options.nocache && options.nocache.toString() === 'true'
      const recursive = options.recursive && options.recursive.toString() === 'true'

      const offline = self._options.offline

      if (!self.isOnline() && !offline) {
        const errMsg = utils.OFFLINE_ERROR

        log.error(errMsg)
        return callback(errcode(errMsg, 'OFFLINE_ERROR'))
      }

      // TODO: params related logic should be in the core implementation

      if (offline && nocache) {
        const error = 'cannot specify both offline and nocache'

        log.error(error)
        return callback(errcode(new Error(error), 'ERR_NOCACHE_AND_OFFLINE'))
      }

      // Set node id as name for being resolved, if it is not received
      if (!name) {
        name = self._peerInfo.id.toB58String()
      }

      if (!name.startsWith('/ipns/')) {
        name = `/ipns/${name}`
      }

      const resolveOptions = {
        nocache,
        recursive
      }

      self._ipns.resolve(name, resolveOptions, callback)
    }),
    pubsub: namePubsub(self)
  }
}
