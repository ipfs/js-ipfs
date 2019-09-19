'use strict'

const debug = require('debug')
const callbackify = require('callbackify')
const human = require('human-to-milliseconds')
const crypto = require('libp2p-crypto')
const errcode = require('err-code')
const mergeOptions = require('merge-options')
const mh = require('multihashes')
const isDomain = require('is-domain-name')
const promisify = require('promisify-es6')

const log = debug('ipfs:name')
log.error = debug('ipfs:name:error')

const namePubsub = require('./name-pubsub')
const utils = require('../utils')
const path = require('../ipns/path')

const keyLookup = async (ipfsNode, kname) => {
  if (kname === 'self') {
    return ipfsNode._peerInfo.id.privKey
  }

  try {
    const pass = ipfsNode._options.pass
    const pem = await ipfsNode._keychain.exportKey(kname, pass)
    const privateKey = await promisify(crypto.keys.import.bind(crypto.keys))(pem, pass)

    return privateKey
  } catch (err) {
    log.error(err)

    throw errcode(err, 'ERR_CANNOT_GET_KEY')
  }
}

const appendRemainder = async (result, remainder) => {
  result = await result

  if (remainder.length) {
    return result + '/' + remainder.join('/')
  }

  return result
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
    publish: callbackify.variadic(async (value, options) => {
      options = options || {}

      const resolve = !(options.resolve === false)
      const lifetime = options.lifetime || '24h'
      const key = options.key || 'self'

      if (!self.isOnline()) {
        throw errcode(new Error(utils.OFFLINE_ERROR), 'OFFLINE_ERROR')
      }

      // TODO: params related logic should be in the core implementation

      // Normalize path value
      try {
        value = utils.normalizePath(value)
      } catch (err) {
        log.error(err)

        throw err
      }

      let pubLifetime
      try {
        pubLifetime = human(lifetime)

        // Calculate lifetime with nanoseconds precision
        pubLifetime = pubLifetime.toFixed(6)
      } catch (err) {
        log.error(err)

        throw err
      }

      // TODO: ttl human for cache
      const results = await Promise.all([
        // verify if the path exists, if not, an error will stop the execution
        keyLookup(self, key),
        resolve.toString() === 'true' ? path.resolvePath(self, value) : Promise.resolve()
      ])

      // Start publishing process
      return self._ipns.publish(results[0], value, pubLifetime)
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
    resolve: callbackify.variadic(async (name, options) => { // eslint-disable-line require-await
      options = mergeOptions({
        nocache: false,
        recursive: true
      }, options || {})

      const offline = self._options.offline

      // TODO: params related logic should be in the core implementation
      if (offline && options.nocache) {
        throw errcode(new Error('cannot specify both offline and nocache'), 'ERR_NOCACHE_AND_OFFLINE')
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
          return appendRemainder(self.dns(hash, options), remainder)
        }

        log.error(err)
        throw errcode(new Error('Invalid IPNS name'), 'ERR_IPNS_INVALID_NAME')
      }

      // multihash is valid lets resolve with IPNS
      // IPNS resolve needs a online daemon
      if (!self.isOnline() && !offline) {
        throw errcode(new Error(utils.OFFLINE_ERROR), 'OFFLINE_ERROR')
      }

      return appendRemainder(self._ipns.resolve(`/${namespace}/${hash}`, options), remainder)
    }),
    pubsub: namePubsub(self)
  }
}
