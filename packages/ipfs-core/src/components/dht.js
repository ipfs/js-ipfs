'use strict'

const PeerId = require('peer-id')
const errCode = require('err-code')
const { NotEnabledError } = require('../errors')
const get = require('dlv')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('../types').NetworkService} config.network
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
module.exports = ({ network, repo }) => {
  const { get, put, findProvs, findPeer, provide, query } = {
    /**
     * @type {import('ipfs-core-types/src/dht').API["get"]}
     */
    async get (key, options = {}) {
      const { libp2p } = await use(network, options)
      return libp2p._dht.get(key, options)
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API["put"]}
     */
    async * put (key, value, options) {
      const { libp2p } = await use(network, options)
      yield * libp2p._dht.put(key, value)
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API["findProvs"]}
     */
    async * findProvs (cid, options = { numProviders: 20 }) {
      const { libp2p } = await use(network, options)

      for await (const peer of libp2p._dht.findProviders(cid, {
        maxNumProviders: options.numProviders,
        signal: options.signal
      })) {
        yield {
          id: peer.id.toB58String(),
          addrs: peer.addrs
        }
      }
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API["findPeer"]}
     */
    async findPeer (peerId, options) {
      const { libp2p } = await use(network, options)
      const peer = await libp2p._dht.findPeer(PeerId.parse(peerId))

      return {
        id: peer.id.toB58String(),
        addrs: peer.multiaddrs
      }
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API["provide"]}
     */
    async * provide (cids, options = { recursive: false }) {
      const { libp2p } = await use(network, options)
      const cidArr = Array.isArray(cids) ? cids : [cids]

      // ensure blocks are actually local
      const hasCids = await Promise.all(cidArr.map(cid => repo.blocks.has(cid)))
      const hasAll = hasCids.every(has => has)

      if (!hasAll) {
        throw errCode(new Error('block(s) not found locally, cannot provide'), 'ERR_BLOCK_NOT_FOUND')
      }

      if (options.recursive) {
        // TODO: Implement recursive providing
        throw errCode(new Error('not implemented yet'), 'ERR_NOT_IMPLEMENTED_YET')
      }

      for (const cid of cidArr) {
        yield libp2p._dht.provide(cid)
      }
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API["query"]}
     */
    async * query (peerId, options) {
      const { libp2p } = await use(network, options)

      for await (const closerPeerId of libp2p._dht.getClosestPeers(PeerId.parse(peerId).toBytes())) {
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
 * @param {import('../types').NetworkService} network
 * @param {import('ipfs-core-types/src/utils').AbortOptions} [options]
 */
const use = async (network, options) => {
  const net = await network.use(options)
  if (get(net.libp2p, '_config.dht.enabled', false)) {
    return net
  } else {
    throw new NotEnabledError('dht not enabled')
  }
}
