'use strict'

const callbackify = require('callbackify')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const CID = require('cids')
const { every, forEach } = require('p-iteration')
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
    get: callbackify.variadic(async (key, options) => { // eslint-disable-line require-await
      options = options || {}

      if (!Buffer.isBuffer(key)) {
        try {
          key = (new CID(key)).buffer
        } catch (err) {
          log.error(err)

          throw errcode(err, 'ERR_INVALID_CID')
        }
      }

      return self.libp2p.dht.get(key, options)
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
    put: callbackify(async (key, value) => { // eslint-disable-line require-await
      if (!Buffer.isBuffer(key)) {
        try {
          key = (new CID(key)).buffer
        } catch (err) {
          log.error(err)

          throw errcode(err, 'ERR_INVALID_CID')
        }
      }

      return self.libp2p.dht.put(key, value)
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
    findProvs: callbackify.variadic(async (key, options) => { // eslint-disable-line require-await
      options = options || {}

      if (typeof key === 'string') {
        try {
          key = new CID(key)
        } catch (err) {
          log.error(err)

          throw errcode(err, 'ERR_INVALID_CID')
        }
      }

      return self.libp2p.contentRouting.findProviders(key, options)
    }),

    /**
     * Query the DHT for all multiaddresses associated with a `PeerId`.
     *
     * @param {PeerId} peer - The id of the peer to search for.
     * @param {function(Error, PeerInfo)} [callback]
     * @returns {Promise<PeerInfo>|void}
     */
    findPeer: callbackify(async (peer) => { // eslint-disable-line require-await
      if (typeof peer === 'string') {
        peer = PeerId.createFromB58String(peer)
      }

      return self.libp2p.peerRouting.findPeer(peer)
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
    provide: callbackify.variadic(async (keys, options) => {
      options = options || {}

      if (!Array.isArray(keys)) {
        keys = [keys]
      }

      // ensure blocks are actually local
      const has = await every(keys, (key) => {
        return self._repo.blocks.has(key)
      })

      if (!has) {
        const errMsg = 'block(s) not found locally, cannot provide'

        log.error(errMsg)
        throw errcode(errMsg, 'ERR_BLOCK_NOT_FOUND')
      }

      if (options.recursive) {
        // TODO: Implement recursive providing
        throw errcode('not implemented yet', 'ERR_NOT_IMPLEMENTED_YET')
      } else {
        await forEach(keys, (cid) => self.libp2p.contentRouting.provide(cid))
      }
    }),

    /**
     * Find the closest peers to a given `PeerId`, by querying the DHT.
     *
     * @param {PeerId} peer - The `PeerId` to run the query agains.
     * @param {function(Error, Array<PeerInfo>)} [callback]
     * @returns {Promise<Array<PeerInfo>>|void}
     */
    query: callbackify(async (peerId) => {
      if (typeof peerId === 'string') {
        try {
          peerId = PeerId.createFromB58String(peerId)
        } catch (err) {
          log.error(err)

          throw err
        }
      }

      try {
        // TODO expose this method in peerRouting
        const peerIds = await self.libp2p._dht.getClosestPeers(peerId.toBytes())

        return peerIds.map((id) => new PeerInfo(id))
      } catch (err) {
        log.error(err)

        throw err
      }
    })
  }
}
