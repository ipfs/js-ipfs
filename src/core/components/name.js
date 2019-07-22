'use strict'

const debug = require('debug')
const promisify = require('promisify-es6')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const human = require('human-to-milliseconds')
const crypto = require('libp2p-crypto')
const errcode = require('err-code')
const mergeOptions = require('merge-options')
const mh = require('multihashes')
const isDomain = require('is-domain-name')

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

const appendRemainder = (cb, remainder) => {
  return (err, result) => {
    if (err) {
      return cb(err)
    }
    if (remainder.length) {
      return cb(null, result + '/' + remainder.join('/'))
    }
    return cb(null, result)
  }
}

/**
 * @typedef { import("../index") } IPFS
 */

/**
 * IPNS - Inter-Planetary Naming System
 *
 * @param {IPFS} self
 * @returns {Object}
 */
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
        return callback(errcode(new Error(utils.OFFLINE_ERROR), 'OFFLINE_ERROR'))
      }

      // TODO: params related logic should be in the core implementation

      // Normalize path value
      try {
        value = utils.normalizePath(value)
      } catch (err) {
        log.error(err)
        return callback(err)
      }

      let pubLifetime
      try {
        pubLifetime = human(lifetime)

        // Calculate lifetime with nanoseconds precision
        pubLifetime = pubLifetime.toFixed(6)
      } catch (err) {
        log.error(err)
        return callback(err)
      }

      // TODO: ttl human for cache

      parallel([
        (cb) => keyLookup(self, key, cb),
        // verify if the path exists, if not, an error will stop the execution
        (cb) => resolve.toString() === 'true' ? path.resolvePath(self, value, cb) : cb()
      ], (err, results) => {
        if (err) {
          log.error(err)
          return callback(err)
        }

        // Start publishing process
        self._ipns.publish(results[0], value, pubLifetime, callback)
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

      options = mergeOptions({
        nocache: false,
        recursive: true
      }, options)

      const offline = self._options.offline

      // TODO: params related logic should be in the core implementation
      if (offline && options.nocache) {
        return callback(errcode(new Error('cannot specify both offline and nocache'), 'ERR_NOCACHE_AND_OFFLINE'))
      }

      // Set node id as name for being resolved, if it is not received
      if (!name) {
        name = self._peerInfo.id.toB58String()
      }

      if (!name.startsWith('/ipns/')) {
        name = `/ipns/${name}`
      }

      const [namespace, hash, ...remainder] = name.slice(1).split('/')
      try {
        mh.fromB58String(hash)
      } catch (err) {
        // lets check if we have a domain ex. /ipns/ipfs.io and resolve with dns
        if (isDomain(hash)) {
          return self.dns(hash, options, appendRemainder(callback, remainder))
        }

        log.error(err)
        return callback(errcode(new Error('Invalid IPNS name'), 'ERR_IPNS_INVALID_NAME'))
      }

      // multihash is valid lets resolve with IPNS
      // IPNS resolve needs a online daemon
      if (!self.isOnline() && !offline) {
        return callback(errcode(new Error(utils.OFFLINE_ERROR), 'OFFLINE_ERROR'))
      }

      self._ipns.resolve(`/${namespace}/${hash}`, options, appendRemainder(callback, remainder))
    }),
    pubsub: namePubsub(self)
  }
}
