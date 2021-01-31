'use strict'

const PeerId = require('peer-id')
const CID = require('cids')
const errCode = require('err-code')
const { NotEnabledError } = require('../errors')
const get = require('dlv')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ network, repo }) => {
  const { get, put, findProvs, findPeer, provide, query } = {
    /**
     * Given a key, query the DHT for its best value.
     *
     * @param {Uint8Array|string} key
     * @param {AbortOptions} [options] - The key associated with the value to find
     * @returns {Promise<Uint8Array>}
     */
    async get (key, options = {}) {
      const { libp2p } = await use(network, options)
      return libp2p._dht.get(normalizeCID(key), options)
    },

    /**
     * Write a key/value pair to the DHT.
     *
     * Given a key of the form /foo/bar and a value of any
     * form, this will write that value to the DHT with
     * that key.
     *
     * @param {Uint8Array} key
     * @param {Uint8Array} value
     * @param {AbortOptions} [options]
     * @returns {AsyncIterable<QueryEvent>}
     */
    async * put (key, value, options) {
      const { libp2p } = await use(network, options)
      yield * libp2p._dht.put(normalizeCID(key), value)
    },

    /**
     * Find peers in the DHT that can provide a specific value, given a CID.
     *
     * @param {CID} cid - They key to find providers for.
     * @param {FindProvsOptions & AbortOptions} [options] - findProviders options
     * @returns {AsyncIterable<PeerInfo>}
     *
     * @example
     * ```js
     * const providers = ipfs.dht.findProvs('QmdPAhQRxrDKqkGPvQzBvjYe3kU8kiEEAd2J6ETEamKAD9')
     * for await (const provider of providers) {
     *   console.log(provider.id.toString())
     * }
     * ```
     */
    async * findProvs (cid, options = {}) {
      const { libp2p } = await use(network, options)
      if (options.numProviders) {
        options.maxNumProviders = options.numProviders
      }

      for await (const peer of libp2p._dht.findProviders(normalizeCID(cid), options)) {
        yield {
          id: peer.id.toB58String(),
          addrs: peer.addrs
        }
      }
    },

    /**
     * Query the DHT for all multiaddresses associated with a `PeerId`.
     *
     * @param {PeerId|CID} peerId - The id of the peer to search for.
     * @param {AbortOptions} [options]
     * @returns {Promise<{id: string, addrs: Multiaddr[]}>}
     * @example
     * ```js
     * const info = await ipfs.dht.findPeer('QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt')
     *
     * console.log(info.id)
     * // QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt
     *
     * info.addrs.forEach(addr => console.log(addr.toString()))
     * // '/ip4/147.75.94.115/udp/4001/quic'
     * // '/ip6/2604:1380:3000:1f00::1/udp/4001/quic'
     * // '/dnsaddr/bootstrap.libp2p.io'
     * // '/ip6/2604:1380:3000:1f00::1/tcp/4001'
     * // '/ip4/147.75.94.115/tcp/4001'
     * ```
     */
    async findPeer (peerId, options) {
      const { libp2p } = await use(network, options)
      if (typeof peerId === 'string') {
        peerId = PeerId.createFromCID(peerId)
      }

      const peer = await libp2p._dht.findPeer(peerId)

      return {
        id: peer.id.toB58String(),
        addrs: peer.multiaddrs
      }
    },

    /**
     * Announce to the network that we are providing given values.
     *
     * @param {CID|CID[]} cids - The keys that should be announced.
     * @param {ProvideOptions & AbortOptions} [options] - provide options
     * @returns {AsyncIterable<QueryEvent>}
     */
    async * provide (cids, options = {}) {
      const { libp2p } = await use(network, options)
      cids = Array.isArray(cids) ? cids : [cids]

      for (const i in cids) {
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
    },

    /**
     * Find the closest peers to a given `PeerId`, by querying the DHT.
     *
     * @param {string|PeerId} peerId - The `PeerId` to run the query against.
     * @param {AbortOptions} [options]
     * @returns {AsyncIterable<{ id: CID, addrs: Multiaddr[] }>}
     */
    async * query (peerId, options) {
      const { libp2p } = await use(network, options)
      if (typeof peerId === 'string') {
        peerId = PeerId.createFromCID(peerId)
      }

      for await (const closerPeerId of libp2p._dht.getClosestPeers(peerId.toBytes())) {
        yield {
          id: closerPeerId.toB58String(),
          addrs: [] // TODO: get addrs?
        }
      }
    }
  }

  return {
    get: withTimeoutOption(get),
    put: withTimeoutOption(put),
    findProvs: withTimeoutOption(findProvs),
    findPeer: withTimeoutOption(findPeer),
    provide: withTimeoutOption(provide),
    query: withTimeoutOption(query)
  }
}

/**
 * Turns given cid in some stringifyeable represenation, to Uint8Array
 * representation. Throws an error if given value isn't a vaild CID.
 *
 * @param {any} cid
 * @returns {Uint8Array}
 */
const parseCID = cid => {
  try {
    const cidStr = cid.toString().split('/')
      .filter(part => part && part !== 'ipfs' && part !== 'ipns')[0]

    return (new CID(cidStr)).bytes
  } catch (error) {
    throw errCode(error, 'ERR_INVALID_CID')
  }
}

/**
 * Turns given cid in some represenation to Uint8Array reperesentation.
 *
 * @param {any} cid
 */
const normalizeCID = cid =>
  cid instanceof Uint8Array ? cid : parseCID(cid)

/**
 * @param {import('.').NetworkService} network
 * @param {AbortOptions} [options]
 */
const use = async (network, options) => {
  const net = await network.use(options)
  if (get(net.libp2p, '_config.dht.enabled', false)) {
    return net
  } else {
    throw new NotEnabledError('dht not enabled')
  }
}
/**
 * @typedef {Object} QueryEvent
 * @property {PeerId} id
 * @property {number} type
 * @property {string} extra
 * @property {PeerInfo[]} responses
 *
 * @typedef {Object} ProvideOptions
 * @property {boolean} [recursive=false] - Provide not only the given object but also all objects linked from it.
 *
 * @typedef {Object} FindProvsOptions
 * @property {number} [numProviders] - maximum number of providers to find
 * @property {number} [maxNumProviders]
 *
 * @typedef {Object} PeerInfo
 * @property {PeerId} id
 * @property {Multiaddr[]} addrs
 *
 * @typedef {import('multiaddr')} Multiaddr
 * @typedef {import('../utils').AbortOptions} AbortOptions
 */
