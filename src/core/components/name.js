'use strict'

const debug = require('debug')
const promisify = require('promisify-es6')
const series = require('async/series')
const waterfall = require('async/waterfall')
const human = require('human-to-milliseconds')

const crypto = require('libp2p-crypto')

const log = debug('jsipfs:name')
log.error = debug('jsipfs:name:error')

const errors = require('../utils')
const path = require('../ipns/path')

const ERR_CANNOT_GET_KEY = 'ERR_CANNOT_GET_KEY'
const ERR_NOCACHE_AND_LOCAL = 'ERR_NOCACHE_AND_LOCAL'

const keyLookup = (ipfsNode, kname, callback) => {
  if (kname === 'self') {
    return callback(null, ipfsNode._peerInfo.id.privKey)
  }

  // jsipfs key gen --type=rsa --size=2048 mykey --pass 12345678901234567890
  // jsipfs daemon --pass 12345678901234567890
  // jsipfs name publish QmPao1o1nEdDYAToEDf34CovQHaycmhr7sagbD3DZAEW9L --key mykey
  const pass = ipfsNode._options.pass

  waterfall([
    (cb) => ipfsNode._keychain.exportKey(kname, pass, cb),
    (pem, cb) => crypto.keys.import(pem, pass, cb)
  ], (err, privateKey) => {
    if (err) {
      const error = `cannot get the specified key`

      log.error(error)
      return callback(Object.assign(new Error(error), { code: ERR_CANNOT_GET_KEY }))
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
     * @param {boolean} resolve resolve given path before publishing.
     * @param {String} lifetime time duration that the record will be valid for.
    This accepts durations such as "300s", "1.5h" or "2h45m". Valid time units are
    "ns", "ms", "s", "m", "h". Default is 24h.
     * @param {String} ttl time duration this record should be cached for (NOT IMPLEMENTED YET).
     * This accepts durations such as "300s", "1.5h" or "2h45m". Valid time units are
     "ns", "ms", "s", "m", "h" (caution: experimental).
     * @param {String} key name of the key to be used or a valid PeerID, as listed by 'ipfs key list -l'.
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    publish: promisify((value, resolve = true, lifetime = '24h', ttl, key = 'self', callback) => {
      if (!self.isOnline()) {
        const error = errors.OFFLINE_ERROR

        log.error(error)
        return callback(new Error(error))
      }

      // Parse path value
      try {
        value = path.parsePath(value)
      } catch (err) {
        log.error(err)
        return callback(err)
      }

      series([
        (cb) => human(lifetime || '1s', cb),
        // (cb) => ttl ? human(ttl, cb) : cb(),
        (cb) => keyLookup(self, key, cb),
        // verify if the path exists, if not, an error will stop the execution
        (cb) => resolve ? path.resolvePath(self, value, cb) : cb()
      ], (err, results) => {
        if (err) {
          log.error(err)
          return callback(err)
        }

        // Calculate eol with nanoseconds precision
        const pubLifetime = results[0].toFixed(6)
        const privateKey = results[1]

        // TODO IMPROVEMENT - Handle ttl for cache
        // const ttl = results[1]
        // const privateKey = results[2]

        // Start publishing process
        self._ipns.publish(privateKey, value, pubLifetime, (err, res) => {
          if (err) {
            log.error(err)
            callback(err)
          }

          callback(null, res)
        })
      })
    }),

    /**
     * Given a key, query the DHT for its best value.
     *
     * @param {String} name ipns name to resolve. Defaults to your node's peerID.
     * @param {boolean} nocache do not use cached entries.
     * @param {boolean} recursive resolve until the result is not an IPNS name.
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    resolve: promisify((name, nocache = false, recursive = false, callback) => {
      const local = true // TODO ROUTING - use self._options.local

      if (!self.isOnline()) {
        const error = errors.OFFLINE_ERROR

        log.error(error)
        return callback(new Error(error))
      }

      if (local && nocache) {
        const error = 'Cannot specify both local and nocache'

        log.error(error)
        return callback(Object.assign(new Error(error), { code: ERR_NOCACHE_AND_LOCAL }))
      }

      // Set node id as name for being resolved, if it is not received
      if (!name) {
        name = self._peerInfo.id.toB58String()
      }

      if (!name.startsWith('/ipns/')) {
        name = `/ipns/${name}`
      }

      // TODO ROUTING - public key from network instead
      const localPublicKey = self._peerInfo.id.pubKey
      const options = {
        local: local,
        nocache: nocache,
        recursive: recursive
      }

      self._ipns.resolve(name, localPublicKey, options, callback)
    })
  }
}
