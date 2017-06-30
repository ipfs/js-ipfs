'use strict'

const promisify = require('promisify-es6')
const every = require('async/every')
const PeerId = require('peer-id')
const CID = require('cids')
const each = require('async/each')
// const bsplit = require('buffer-split')

module.exports = (self) => {
  return {
    /**
     * Given a key, query the DHT for its best value.
     *
     * @param {Buffer} key
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    get: promisify((key, options, callback) => {
      if (!Buffer.isBuffer(key)) {
        return callback(new Error('Not valid key'))
      }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      self._libp2pNode.dht.get(key, options.timeout, callback)
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
        return callback(new Error('Not valid key'))
      }

      self._libp2pNode.dht.put(key, value, callback)
    }),

    /**
     * Find peers in the DHT that can provide a specific value, given a key.
     *
     * @param {CID} key - They key to find providers for.
     * @param {function(Error, Array<PeerInfo>)} [callback]
     * @returns {Promise<PeerInfo>|void}
     */
    findprovs: promisify((key, callback) => {
      if (typeof key === 'string') {
        key = new CID(key)
      }

      self._libp2pNode.contentRouting.findProviders(key, callback)
    }),

    /**
     * Query the DHT for all multiaddresses associated with a `PeerId`.
     *
     * @param {PeerId} peer - The id of the peer to search for.
     * @param {function(Error, Array<Multiaddr>)} [callback]
     * @returns {Promise<Array<Multiaddr>>|void}
     */
    findpeer: promisify((peer, callback) => {
      if (typeof peer === 'string') {
        peer = PeerId.createFromB58String(peer)
      }

      self._libp2pNode.peerRouting.findPeer(peer, (err, info) => {
        if (err) {
          return callback(err)
        }

        // convert to go-ipfs return value, we need to revisit
        // this. For now will just conform.
        const goResult = [
          {
            Responses: [{
              ID: info.id.toB58String(),
              Addresses: info.multiaddrs.toArray().map((a) => a.toString())
            }]
          }
        ]

        callback(null, goResult)
      })
    }),

    /**
     * Announce to the network that we are providing given values.
     *
     * @param {CID|Array<CID>} keys - The keys that should be announced.
     * @param {Object} [options={}]
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

      // ensure blocks are actually local
      every(keys, (key, cb) => {
        self._repo.blocks.has(key, cb)
      }, (err, has) => {
        if (err) {
          return callback(err)
        }
        /* TODO reconsider this. go-ipfs provides anyway
        if (!has) {
          return callback(new Error('Not all blocks exist locally, can not provide'))
        }
        */

        if (options.recursive) {
          // TODO: Implement recursive providing
        } else {
          each(keys, (cid, cb) => {
            self._libp2pNode.contentRouting.provide(cid, cb)
          }, callback)
        }
      })
    }),

    /**
     * Find the closest peers to a given `PeerId`, by querying the DHT.
     *
     * @param {PeerId} peer - The `PeerId` to run the query agains.
     * @param {function(Error, Array<PeerId>)} [callback]
     * @returns {Promise<Array<PeerId>>|void}
     */
    query: promisify((peerId, callback) => {
      if (typeof peerId === 'string') {
        peerId = PeerId.createFromB58String(peerId)
      }

      // TODO expose this method in peerRouting
      self._libp2pNode._dht.getClosestPeers(peerId.toBytes(), (err, peerIds) => {
        if (err) {
          return callback(err)
        }
        callback(null, peerIds.map((id) => {
          return { ID: id.toB58String() }
        }))
      })
    })
  }
}
