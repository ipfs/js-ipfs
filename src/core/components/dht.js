'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const CID = require('cids')
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
     * @returns {Promise}
     */
    get: async (key, options) => { // eslint-disable-line require-await
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
    },

    /**
     * Write a key/value pair to the DHT.
     *
     * Given a key of the form /foo/bar and a value of any
     * form, this will write that value to the DHT with
     * that key.
     *
     * @param {Buffer} key
     * @param {Buffer} value
     * @returns {Promise|void}
     */
    put: async (key, value) => { // eslint-disable-line require-await
      if (!Buffer.isBuffer(key)) {
        try {
          key = (new CID(key)).buffer
        } catch (err) {
          log.error(err)

          throw errcode(err, 'ERR_INVALID_CID')
        }
      }

      return self.libp2p.dht.put(key, value)
    },

    /**
     * Find peers in the DHT that can provide a specific value, given a key.
     *
     * @param {CID} key - They key to find providers for.
     * @param {Object} options - findProviders options
     * @param {number} options.timeout - how long the query should maximally run, in milliseconds (default: 60000)
     * @param {number} options.maxNumProviders - maximum number of providers to find
     * @returns {Promise<PeerInfo>}
     */
    findProvs: async (key, options) => { // eslint-disable-line require-await
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
    },

    /**
     * Query the DHT for all multiaddresses associated with a `PeerId`.
     *
     * @param {PeerId} peer - The id of the peer to search for.
     * @param {function(Error, PeerInfo)} [callback]
     * @returns {Promise<PeerInfo>|void}
     */
    findPeer: async (peer) => { // eslint-disable-line require-await
      if (typeof peer === 'string') {
        peer = PeerId.createFromCID(peer)
      }

      return self.libp2p.peerRouting.findPeer(peer)
    },

    /**
     * Announce to the network that we are providing given values.
     *
     * @param {CID|Array<CID>} keys - The keys that should be announced.
     * @param {Object} options - provide options
     * @param {bool} [options.recursive=false] - Provide not only the given object but also all objects linked from it.
     * @returns {Promise}
     */
    provide: async (keys, options) => {
      options = options || {}

      if (!Array.isArray(keys)) {
        keys = [keys]
      }
      for (var i in keys) {
        if (typeof keys[i] === 'string') {
          try {
            keys[i] = new CID(keys[i])
          } catch (err) {
            log.error(err)
            throw errcode(err, 'ERR_INVALID_CID')
          }
        }
      }

      // ensure blocks are actually local
      const hasKeys = await Promise.all(keys.map(k => self._repo.blocks.has(k)))
      const hasAll = hasKeys.every(has => has)

      if (!hasAll) {
        const errMsg = 'block(s) not found locally, cannot provide'

        log.error(errMsg)
        throw errcode(errMsg, 'ERR_BLOCK_NOT_FOUND')
      }

      if (options.recursive) {
        // TODO: Implement recursive providing
        throw errcode('not implemented yet', 'ERR_NOT_IMPLEMENTED_YET')
      } else {
        await Promise.all(keys.map(k => self.libp2p.contentRouting.provide(k)))
      }
    },

    /**
     * Find the closest peers to a given `PeerId`, by querying the DHT.
     *
     * @param {PeerId} peer - The `PeerId` to run the query agains.
     * @param {function(Error, Array<PeerInfo>)} [callback]
     * @returns {Promise<Array<PeerInfo>>|void}
     */
    query: async (peerId) => {
      if (typeof peerId === 'string') {
        try {
          peerId = PeerId.createFromCID(peerId)
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
    }
  }
}
