'use strict'

const promisify = require('promisify-es6')
const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const human = require('human-to-milliseconds')

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

const publish = (ipfsNode, privateKey, ipfsPath, publishOptions, callback) => {
  // Should verify if exists ?
  if (publishOptions.verifyIfExists) {
    // TODO resolve
    // https://github.com/ipfs/go-ipfs/blob/master/core/commands/publish.go#L172
  }

  // Add pubValidTime

  // Publish
  const eol = new Date(Date.now())

  ipfsNode._namesys.publishWithEOL(privateKey, ipfsPath, eol, (err, res) => {
    if (err) {
      callback(err)
    }

    // TODO HERE HERE HERE

    callback(null, res)
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
     * @param {String} ipfsPath
     * @param {Object} options
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    publish: promisify((ipfsPath, callback) => {
      // https://github.com/ipfs/go-ipfs/blob/master/core/commands/publish.go
      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      // TODO Validate Mounts IPNS - cannot manually publish while IPNS is mounted

      // TODO Validate Node identity not validated

      // TODO Parse options and create object
      const options = {
        resolve: true,
        d: '24h',
        ttl: undefined,
        key: 'self'
      }

      // TODO Create waterfall
      /* waterfall([
        (cb) => human(options.d || '1s', cb),
      ], callback) */

      human(options.d || '1s', (err, value) => {
        if (err) {
          return callback(new Error('Error parsing lifetime option'))
        }

        const publishOptions = {
          verifyIfExists: options.resolve,
          pubValidTime: value
        }

        // TODO Date.now() + value

        // TODO TTL integration

        // Get Key
        keyLookup(self, options.key, (err, key) => {
          if (err) {
            return callback(err)
          }

          // TODO ParsePath
          // https://github.com/ipfs/go-ipfs/blob/master/path/path.go

          publish(self, key, ipfsPath, publishOptions, (err, result) => {
            if (err) {
              callback(err)
            }

            return callback(null, result)
          })
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

      if (typeof name === 'function') {
        callback = name
        name = undefined
      }

      if (!self.isOnline()) {
        return callback(new Error(OFFLINE_ERROR))
      }

      // let resolver = self._namesys.ipnsResolver

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

      const pubKey = self._peerInfo.id.pubKey

      self._namesys.resolve(name, pubKey, (err, result) => {
        if (err) {
          return callback(err)
        }

        return callback(null, result)
      })
    })
  }
}
