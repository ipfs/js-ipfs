'use strict'

const PeerId = require('peer-id')
const CID = require('cids')
const errCode = require('err-code')
const { withTimeoutOption } = require('../utils')

module.exports = ({ libp2p, repo }) => {
  return {
    /**
     * Given a key, query the DHT for its best value.
     *
     * @param {Uint8Array} key
     * @param {Object} [options] - get options
     * @param {number} [options.timeout] - optional timeout
     * @returns {Promise<Uint8Array>}
     */
    get: withTimeoutOption(async (key, options) => { // eslint-disable-line require-await
      options = options || {}

      if (!(key instanceof Uint8Array)) {
        try {
          key = key.toString().split('/')
            .filter(part => part && part !== 'ipfs' && part !== 'ipns')
            .shift()

          key = (new CID(key)).bytes
        } catch (err) {
          throw errCode(err, 'ERR_INVALID_CID')
        }
      }

      return libp2p._dht.get(key, options)
    }),

    /**
     * Write a key/value pair to the DHT.
     *
     * Given a key of the form /foo/bar and a value of any
     * form, this will write that value to the DHT with
     * that key.
     *
     * @param {Uint8Array} key
     * @param {Uint8Array} value
     * @returns {Promise}
     */
    put: withTimeoutOption(async (key, value) => { // eslint-disable-line require-await
      if (!(key instanceof Uint8Array)) {
        try {
          key = key.toString().split('/')
            .filter(part => part && part !== 'ipfs' && part !== 'ipns')
            .shift()

          key = (new CID(key)).bytes
        } catch (err) {
          throw errCode(err, 'ERR_INVALID_CID')
        }
      }

      return libp2p._dht.put(key, value)
    }),

    /**
     * Find peers in the DHT that can provide a specific value, given a key.
     *
     * @param {CID} key - They key to find providers for.
     * @param {Object} [options] - findProviders options
     * @param {number} [options.timeout] - how long the query should maximally run, in milliseconds (default: 60000)
     * @param {number} [options.numProviders] - maximum number of providers to find
     * @returns {AsyncIterable<{ id: CID, addrs: Multiaddr[] }>}
     */
    findProvs: withTimeoutOption(async function * (key, options) { // eslint-disable-line require-await
      options = options || {}

      if (typeof key === 'string') {
        try {
          key = new CID(key)
        } catch (err) {
          throw errCode(err, 'ERR_INVALID_CID')
        }
      }

      if (options.numProviders) {
        options.maxNumProviders = options.numProviders
      }

      for await (const peer of libp2p._dht.findProviders(key, options)) {
        yield {
          id: peer.id.toB58String(),
          addrs: peer.addrs
        }
      }
    }),

    /**
     * Query the DHT for all multiaddresses associated with a `PeerId`.
     *
     * @param {PeerId} peerId - The id of the peer to search for.
     * @returns {Promise<{ id: String, addrs: Multiaddr[] }>}
     */
    findPeer: withTimeoutOption(async peerId => { // eslint-disable-line require-await
      if (typeof peerId === 'string') {
        peerId = PeerId.createFromCID(peerId)
      }

      const peer = await libp2p._dht.findPeer(peerId)

      return {
        id: peer.id.toB58String(),
        addrs: peer.multiaddrs
      }
    }),

    /**
     * Announce to the network that we are providing given values.
     *
     * @param {CID|CID[]} cids - The keys that should be announced.
     * @param {Object} [options] - provide options
     * @param {bool} [options.recursive=false] - Provide not only the given object but also all objects linked from it.
     * @returns {Promise}
     */
    provide: withTimeoutOption(async function * (cids, options) {
      cids = Array.isArray(cids) ? cids : [cids]
      options = options || {}

      for (var i in cids) {
        if (typeof cids[i] === 'string') {
          try {
            cids[i] = new CID(cids[i])
          } catch (err) {
            throw errCode(err, 'ERR_INVALID_CID')
          }
        }
      }

      // ensure blocks are actually local
      const hasCids = await Promise.all(cids.map(cid => repo.blocks.has(cid)))
      const hasAll = hasCids.every(has => has)

      if (!hasAll) {
        throw errCode(new Error('block(s) not found locally, cannot provide'), 'ERR_BLOCK_NOT_FOUND')
      }

      if (options.recursive) {
        // TODO: Implement recursive providing
        throw errCode(new Error('not implemented yet'), 'ERR_NOT_IMPLEMENTED_YET')
      }

      for (const cid of cids) {
        yield libp2p._dht.provide(cid)
      }
    }),

    /**
     * Find the closest peers to a given `PeerId`, by querying the DHT.
     *
     * @param {string|PeerId} peerId - The `PeerId` to run the query against.
     * @returns {AsyncIterable<{ id: CID, addrs: Multiaddr[] }>}
     */
    query: withTimeoutOption(async function * (peerId) {
      if (typeof peerId === 'string') {
        peerId = PeerId.createFromCID(peerId)
      }

      for await (const closerPeerId of libp2p._dht.getClosestPeers(peerId.toBytes())) {
        yield {
          id: closerPeerId.toB58String(),
          addrs: [] // TODO: get addrs?
        }
      }
    })
  }
}
