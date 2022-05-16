import errCode from 'err-code'
import { NotEnabledError } from '../errors.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { base36 } from 'multiformats/bases/base36'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { peerIdFromString } from '@libp2p/peer-id'

/**
 * @typedef {import('@libp2p/interfaces/dht').QueryEvent} QueryEvent
 * @typedef {import('./network').Network} Network
 * @typedef {import('@libp2p/interfaces/peer-id').PeerId} PeerId
 */

const IPNS_PREFIX = '/ipns/'

/**
 * @param {string} str
 */
function toDHTKey (str) {
  if (str.startsWith(IPNS_PREFIX)) {
    str = str.substring(IPNS_PREFIX.length)
  }

  /** @type {Uint8Array|undefined} */
  let buf

  if (str[0] === '1' || str[0] === 'Q') {
    // ed25519 key or hash of rsa key
    str = `z${str}`
  }

  if (str[0] === 'z') {
    buf = base58btc.decode(str)
  }

  if (str[0] === 'k') {
    // base36 encoded string
    buf = base36.decode(str)
  }

  if (!buf) {
    throw new Error('Could not parse string')
  }

  if (buf[0] !== 0x01 && buf[1] !== 0x72) {
    // prefix key with CIDv1 and libp2p-key codec
    buf = uint8ArrayConcat([
      [0x01, 0x72],
      buf
    ])
  }

  if (buf.length !== 40) {
    throw new Error('Incorrect length ' + buf.length)
  }

  return uint8ArrayConcat([
    uint8ArrayFromString(IPNS_PREFIX),
    buf.subarray(2)
  ])
}

/**
 * @param {object} config
 * @param {import('../types').NetworkService} config.network
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {PeerId} config.peerId
 */
export function createDht ({ network, repo, peerId }) {
  const { get, put, findProvs, findPeer, provide, query } = {
    /**
     * @type {import('ipfs-core-types/src/dht').API<{}>["get"]}
     */
    async * get (key, options = {}) {
      const { libp2p } = await use(network, peerId, options)

      const dhtKey = key instanceof Uint8Array ? key : toDHTKey(key)

      if (libp2p.dht == null) {
        throw errCode(new Error('dht not configured'), 'ERR_DHT_NOT_CONFIGURED')
      }

      yield * libp2p.dht.get(dhtKey, options)
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API<{}>["put"]}
     */
    async * put (key, value, options) {
      const { libp2p } = await use(network, peerId, options)

      const dhtKey = key instanceof Uint8Array ? key : toDHTKey(key)

      if (libp2p.dht == null) {
        throw errCode(new Error('dht not configured'), 'ERR_DHT_NOT_CONFIGURED')
      }

      yield * libp2p.dht.put(dhtKey, value)
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API<{}>["findProvs"]}
     */
    async * findProvs (cid, options = {}) {
      const { libp2p } = await use(network, peerId, options)

      if (libp2p.dht == null) {
        throw errCode(new Error('dht not configured'), 'ERR_DHT_NOT_CONFIGURED')
      }

      yield * libp2p.dht.findProviders(cid, {
        signal: options.signal
      })
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API<{}>["findPeer"]}
     */
    async * findPeer (peerIdToFind, options = {}) {
      const { libp2p } = await use(network, peerId, options)

      if (libp2p.dht == null) {
        throw errCode(new Error('dht not configured'), 'ERR_DHT_NOT_CONFIGURED')
      }

      yield * libp2p.dht.findPeer(peerIdToFind, {
        signal: options.signal
      })
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API<{}>["provide"]}
     */
    async * provide (cid, options = { recursive: false }) {
      const { libp2p } = await use(network, peerId, options)

      // ensure blocks are actually local
      const hasBlock = await repo.blocks.has(cid)

      if (!hasBlock) {
        throw errCode(new Error('block(s) not found locally, cannot provide'), 'ERR_BLOCK_NOT_FOUND')
      }

      if (options.recursive) {
        // TODO: Implement recursive providing
        throw errCode(new Error('not implemented yet'), 'ERR_NOT_IMPLEMENTED_YET')
      }

      if (libp2p.dht == null) {
        throw errCode(new Error('dht not configured'), 'ERR_DHT_NOT_CONFIGURED')
      }

      yield * libp2p.dht.provide(cid)
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API<{}>["query"]}
     */
    async * query (peerIdToQuery, options = {}) {
      const { libp2p } = await use(network, peerId, options)
      let bytes
      const asCid = CID.asCID(peerIdToQuery)

      if (asCid != null) {
        bytes = asCid.multihash.bytes
      } else {
        bytes = peerIdFromString(peerIdToQuery.toString()).toBytes()
      }

      if (libp2p.dht == null) {
        throw errCode(new Error('dht not configured'), 'ERR_DHT_NOT_CONFIGURED')
      }

      yield * libp2p.dht.getClosestPeers(bytes, options)
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
 * @param {PeerId} peerId
 * @param {import('ipfs-core-types/src/utils').AbortOptions} [options]
 * @returns {Promise<Network>}
 */
const use = async (network, peerId, options) => {
  const net = await network.use(options)
  if (net.libp2p.dht != null) {
    return net
  } else {
    const fn = async function * () {
      yield {
        from: peerId,
        name: 'QUERY_ERROR',
        type: 3,
        error: new NotEnabledError('dht not enabled')
      }
    }

    return {
      libp2p: {
        dht: {
          // @ts-expect-error incomplete implementation
          get: fn,
          // @ts-expect-error incomplete implementation
          put: fn,
          // @ts-expect-error incomplete implementation
          findProviders: fn,
          // @ts-expect-error incomplete implementation
          findPeer: fn,
          // @ts-expect-error incomplete implementation
          provide: fn,
          // @ts-expect-error incomplete implementation
          getClosestPeers: fn
        }
      }
    }
  }
}
