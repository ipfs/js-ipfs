'use strict'

const promisify = require('promisify-es6')
const series = require('async/series')
const human = require('human-to-milliseconds')

const errors = require('../utils')
const path = require('../ipns/path')

const keyLookup = (ipfsNode, kname, cb) => {
  if (kname === 'self') {
    return cb(null, ipfsNode._peerInfo.id.privKey)
  }
  // TODO validate - jsipfs daemon --pass 123456sddadesfgefrsfesfefsfeesfe
  ipfsNode._keychain.findKeyByName(kname, (err, key) => {
    if (err) {
      return cb(err)
    }

    return cb(null, key)
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
     * Examples: TODO such as in go
     *
     * @param {String} value ipfs path of the object to be published.
     * @param {boolean} resolve resolve given path before publishing.
     * @param {String} lifetime time duration that the record will be valid for.
    This accepts durations such as "300s", "1.5h" or "2h45m". Valid time units are
    "ms", "s", "m", "h".
     * @param {String} ttl time duration this record should be cached for (caution: experimental).
     * @param {String} key name of the key to be used or a valid PeerID, as listed by 'ipfs key list -l'.
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    publish: promisify((value, resolve = true, lifetime = '24h', ttl, key = 'self', callback) => {
      if (!self.isOnline()) {
        return callback(new Error(errors.OFFLINE_ERROR))
      }

      // Parse path value
      try {
        value = path.parsePath(value)
      } catch (err) {
        return callback(err)
      }

      series([
        (cb) => human(lifetime || '1s', cb),
        // (cb) => ttl ? human(ttl, cb) : cb(),
        (cb) => keyLookup(self, key, cb),
        (cb) => resolve ? path.resolvePath(self, value, cb) : cb() // if not resolved, and error will stop the execution
      ], (err, results) => {
        if (err) {
          return callback(err)
        }

        const pubValidTime = results[0]
        const privateKey = results[1]

        // TODO IMPROVEMENT - Handle ttl for cache
        // const ttl = results[1]
        // const privateKey = results[2]

        // Calculate eol
        const eol = new Date(Date.now() + pubValidTime)

        // Start publishing process
        self._ipns.publish(privateKey, value, eol, (err, res) => {
          if (err) {
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
    resolve: promisify((name, nocache, recursive, callback) => {
      const local = true

      if (!self.isOnline()) {
        return callback(new Error(errors.OFFLINE_ERROR))
      }

      if (local && nocache) {
        return callback(new Error('Cannot specify both local and nocache'))
      }

      // Set node id as name for being resolved, if it is not received
      if (!name) {
        name = self._peerInfo.id.toB58String()
      }

      if (!name.startsWith('/ipns/')) {
        name = `/ipns/${name}`
      }

      // TODO local public key?
      const pubKey = self._peerInfo.id.pubKey
      const options = {
        local: local,
        nocache: nocache,
        recursive: recursive
      }

      self._ipns.resolve(name, pubKey, options, (err, result) => {
        if (err) {
          return callback(err)
        }

        return callback(null, result)
      })
    })
  }
}
