'use strict'

const PeerId = require('peer-id')
const CID = require('cids')
const errCode = require('err-code')
const { withTimeoutOption } = require('../utils')
const { Buffer } = require('buffer')

/**
 * @typedef {import('./init').LibP2P} LibP2P
 * @typedef {import('./init').IPFSRepo} IPFSRepo
 * @typedef {import('multiaddr')} Multiaddr
 * @typedef {import('../utils').WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @typedef {Object} DHTConfig
 * @property {LibP2P} libp2p
 * @property {IPFSRepo} repo
 *
 * @typedef {Object} DHT
 * @property {Get} get
 * @property {Put} put
 * @property {FindProvs} findProvs
 * @property {FindPeer} findPeer
 * @property {Provide} provide
 * @property {Query} query
 */

/**
 * @callback Get
 * Given a key, query the DHT for its best value.
 * @param {Buffer} key
 * @param {Object} [options] - get options
 * @param {number} [options.timeout] - optional timeout
 * @returns {Promise<Buffer>}
 */

/**
 * @callback Put
 * Write a key/value pair to the DHT.
 *
 * Given a key of the form /foo/bar and a value of any
 * form, this will write that value to the DHT with
 * that key.
 * @param {Buffer} key
 * @param {Buffer} value
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} FindProvsOptions
 * @property {number} [numProviders] - maximum number of providers to
 * find
 * @property {number} [maxNumProviders]
 * @property {number} [timeout] - how long the query should maximally run,
 * in milliseconds (default: 60000)
 * @property {AbortSignal} [signal]
 *
 * @callback FindProvs
 * Find peers in the DHT that can provide a specific value, given a key.
 *
 * @param {CID} key - They key to find providers for.
 * @param {FindProvsOptions} [options] - findProviders options
 * @returns {AsyncIterable<{ id: CID, addrs: Multiaddr[] }>}
 */

/**
 * @callback FindPeer
 * Query the DHT for all multiaddresses associated with a `PeerId`.
 *
 * @param {PeerId} peerId - The id of the peer to search for.
 * @param {WithTimeoutOptions} [options] - findProviders options
 * @returns {Promise<{ id: CID, addrs: Multiaddr[] }>}
 */

/**
 * @typedef {Object} ProvideOptions
 * @property {boolean} [recursive=false] - Provide not only the given object
 * but also all objects linked from it.
 *
 * @callback Provide
 * Announce to the network that we are providing given values.
 *
 * @param {CID|CID[]} keys - The keys that should be announced.
 * @param {ProvideOptions} [options] - provide options
 * @returns {Promise<void>}
 */

/**
 * @callback Query
 * Find the closest peers to a given `PeerId`, by querying the DHT.
 *
 * @param {string|PeerId} peerId - The `PeerId` to run the query against.
 * @returns {AsyncIterable<{ id: CID, addrs: Multiaddr[] }>}
 */

/**
 *
 * @param {DHTConfig} config
 * @returns {DHT}
 */
module.exports = ({ libp2p, repo }) => {
  return {
    get: withTimeoutOption(async (key, options) => { // eslint-disable-line require-await
      options = options || {}

      if (!Buffer.isBuffer(key)) {
        try {
          key = (new CID(key)).buffer
        } catch (err) {
          throw errCode(err, 'ERR_INVALID_CID')
        }
      }

      return libp2p._dht.get(key, options)
    }),

    put: withTimeoutOption(async (key, value) => { // eslint-disable-line require-await
      if (!Buffer.isBuffer(key)) {
        try {
          key = (new CID(key)).buffer
        } catch (err) {
          throw errCode(err, 'ERR_INVALID_CID')
        }
      }

      return libp2p._dht.put(key, value)
    }),

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

      for await (const peerInfo of libp2p._dht.findProviders(key, options)) {
        yield {
          id: peerInfo.id.toB58String(),
          addrs: peerInfo.multiaddrs.toArray()
        }
      }
    }),

    findPeer: withTimeoutOption(async (peerId) => { // eslint-disable-line require-await
      if (typeof peerId === 'string') {
        peerId = PeerId.createFromCID(peerId)
      }

      const peerInfo = await libp2p._dht.findPeer(peerId)

      return {
        id: peerInfo.id.toB58String(),
        addrs: peerInfo.multiaddrs.toArray()
      }
    }),

    provide: withTimeoutOption(async (keys, options) => {
      keys = Array.isArray(keys) ? keys : [keys]
      options = options || {}

      for (var i in keys) {
        if (typeof keys[i] === 'string') {
          try {
            keys[i] = new CID(keys[i])
          } catch (err) {
            throw errCode(err, 'ERR_INVALID_CID')
          }
        }
      }

      // ensure blocks are actually local
      const hasKeys = await Promise.all(keys.map(k => repo.blocks.has(k)))
      const hasAll = hasKeys.every(has => has)

      if (!hasAll) {
        throw errCode('block(s) not found locally, cannot provide', 'ERR_BLOCK_NOT_FOUND')
      }

      if (options.recursive) {
        // TODO: Implement recursive providing
        throw errCode('not implemented yet', 'ERR_NOT_IMPLEMENTED_YET')
      } else {
        await Promise.all(keys.map(k => libp2p._dht.provide(k)))
      }
    }),

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
