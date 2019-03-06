'use strict'

const promisify = require('promisify-es6')
const every = require('async/every')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const CID = require('cids')
const each = require('async/each')
const nextTick = require('async/nextTick')

const errcode = require('err-code')

const debug = require('debug')
const log = debug('ipfs:dht')
log.error = debug('ipfs:dht:error')

module.exports = (self) => {
  return {
    /**
     * Given a key, query the DHT for its best value.
     *
     * @param {Buffer} key
     * @param {Object} options - get options
     * @param {number} options.timeout - optional timeout
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    get: promisify((key, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      if (!Buffer.isBuffer(key)) {
        try {
          key = (new CID(key)).buffer
        } catch (err) {
          log.error(err)

          return nextTick(() => callback(errcode(err, 'ERR_INVALID_CID')))
        }
      }

      self.libp2p.dht.get(key, options, callback)
    }),

    /**
     * Write a key/value pair to the DHT.
     *
     * Given a key of the form /foo/bar and a value of any
     * form, this will write that value to the DHT with
     * that key.
     *
     * @param {Buffer} key
     * @param {Buffer} value
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    put: promisify((key, value, callback) => {
      if (!Buffer.isBuffer(key)) {
        try {
          key = (new CID(key)).buffer
        } catch (err) {
          log.error(err)

          return nextTick(() => callback(errcode(err, 'ERR_INVALID_CID')))
        }
      }

      self.libp2p.dht.put(key, value, callback)
    }),

    /**
     * Find peers in the DHT that can provide a specific value, given a key.
     *
     * @param {CID} key - They key to find providers for.
     * @param {Object} options - findProviders options
     * @param {number} options.timeout - how long the query should maximally run, in milliseconds (default: 60000)
     * @param {number} options.maxNumProviders - maximum number of providers to find
     * @param {function(Error, Array<PeerInfo>)} [callback]
     * @returns {Promise<PeerInfo>|void}
     */
    findProvs: promisify((key, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      if (typeof key === 'string') {
        try {
          key = new CID(key)
        } catch (err) {
          log.error(err)

          return nextTick(() => callback(errcode(err, 'ERR_INVALID_CID')))
        }
      }

      self.libp2p.contentRouting.findProviders(key, options, callback)
    }),

    /**
     * Query the DHT for all multiaddresses associated with a `PeerId`.
     *
     * @param {PeerId} peer - The id of the peer to search for.
     * @param {function(Error, PeerInfo)} [callback]
     * @returns {Promise<PeerInfo>|void}
     */
    findPeer: promisify((peer, callback) => {
      if (typeof peer === 'string') {
        peer = PeerId.createFromB58String(peer)
      }

      self.libp2p.peerRouting.findPeer(peer, callback)
    }),

    /**
     * Announce to the network that we are providing given values.
     *
     * @param {CID|Array<CID>} keys - The keys that should be announced.
     * @param {Object} options - provide options
     * @param {bool} [options.recursive=false] - Provide not only the given object but also all objects linked from it.
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    provide: promisify((keys, options, callback) => {
      if (!Array.isArray(keys)) {
        keys = [keys]
      }
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      // ensure blocks are actually local
      every(keys, (key, cb) => {
        self._repo.blocks.has(key, cb)
      }, (err, has) => {
        if (err) {
          return callback(err)
        }

        if (!has) {
          const errMsg = 'block(s) not found locally, cannot provide'

          log.error(errMsg)
          return callback(errcode(errMsg, 'ERR_BLOCK_NOT_FOUND'))
        }

        if (options.recursive) {
          // TODO: Implement recursive providing
          return callback(errcode('not implemented yet', 'ERR_NOT_IMPLEMENTED_YET'))
        } else {
          each(keys, (cid, cb) => {
            self.libp2p.contentRouting.provide(cid, cb)
          }, callback)
        }
      })
    }),

    /**
     * Find the closest peers to a given `PeerId`, by querying the DHT.
     *
     * @param {PeerId} peer - The `PeerId` to run the query agains.
     * @param {function(Error, Array<PeerInfo>)} [callback]
     * @returns {Promise<Array<PeerInfo>>|void}
     */
    query: promisify((peerId, callback) => {
      if (typeof peerId === 'string') {
        try {
          peerId = PeerId.createFromB58String(peerId)
        } catch (err) {
          log.error(err)
          return callback(err)
        }
      }

      // TODO expose this method in peerRouting
      self.libp2p._dht.getClosestPeers(peerId.toBytes(), (err, peerIds) => {
        if (err) {
          log.error(err)
          return callback(err)
        }

        callback(null, peerIds.map((id) => new PeerInfo(id)))
      })
    })
  }
}
