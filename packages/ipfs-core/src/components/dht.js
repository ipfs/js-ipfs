import PeerId from 'peer-id'
import errCode from 'err-code'
import { NotEnabledError } from '../errors.js'
import get from 'dlv'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import map from 'it-map'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { base36 } from 'multiformats/bases/base36'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @typedef {import('libp2p-kad-dht').QueryEvent} DHTQueryEvent
 * @typedef {import('ipfs-core-types/src/dht').QueryEvent} QueryEvent
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
 * @param {DHTQueryEvent} event
 * @returns {QueryEvent}
 */
function mapEvent (event) {
  if (event.name === 'SENDING_QUERY') {
    return {
      type: event.type,
      name: event.name,
      to: event.to.toB58String()
    }
  }

  if (event.name === 'PEER_RESPONSE') {
    return {
      type: event.type,
      name: event.name,
      messageType: event.messageType,
      messageName: event.messageName,
      closer: event.closer.map(({ id, multiaddrs }) => ({ id: id.toB58String(), multiaddrs })),
      providers: event.providers.map(({ id, multiaddrs }) => ({ id: id.toB58String(), multiaddrs })),
      record: event.record,
      from: event.from.toB58String()
    }
  }

  if (event.name === 'FINAL_PEER') {
    return {
      type: event.type,
      name: event.name,
      from: event.from.toB58String(),
      peer: {
        id: event.peer.id.toB58String(),
        multiaddrs: event.peer.multiaddrs
      }
    }
  }

  if (event.name === 'QUERY_ERROR') {
    return {
      type: event.type,
      name: event.name,
      error: event.error,
      from: event.from.toB58String()
    }
  }

  if (event.name === 'PROVIDER') {
    return {
      type: event.type,
      name: event.name,
      providers: event.providers.map(({ id, multiaddrs }) => ({ id: id.toB58String(), multiaddrs })),
      from: event.from.toB58String()
    }
  }

  if (event.name === 'VALUE') {
    return {
      type: event.type,
      name: event.name,
      value: event.value,
      from: event.from.toB58String()
    }
  }

  if (event.name === 'ADDING_PEER') {
    return {
      type: event.type,
      name: event.name,
      peer: event.peer.toB58String()
    }
  }

  if (event.name === 'DIALING_PEER') {
    return {
      type: event.type,
      name: event.name,
      peer: event.peer.toB58String()
    }
  }

  throw errCode(new Error('Unknown DHT event type'), 'ERR_UNKNOWN_DHT_EVENT')
}

/**
 * @param {Object} config
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

      yield * map(libp2p._dht.get(dhtKey, options), mapEvent)
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API<{}>["put"]}
     */
    async * put (key, value, options) {
      const { libp2p } = await use(network, peerId, options)

      const dhtKey = key instanceof Uint8Array ? key : toDHTKey(key)

      yield * map(libp2p._dht.put(dhtKey, value), mapEvent)
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API<{}>["findProvs"]}
     */
    async * findProvs (cid, options = {}) {
      const { libp2p } = await use(network, peerId, options)

      yield * map(libp2p._dht.findProviders(cid, {
        signal: options.signal
      }), mapEvent)
    },

    /**
     * @type {import('ipfs-core-types/src/dht').API<{}>["findPeer"]}
     */
    async * findPeer (peerIdToFind, options = {}) {
      const { libp2p } = await use(network, peerId, options)

      yield * map(libp2p._dht.findPeer(PeerId.parse(peerIdToFind), {
        signal: options.signal
      }), mapEvent)
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

      yield * map(libp2p._dht.provide(cid), mapEvent)
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
        bytes = PeerId.parse(peerIdToQuery.toString()).toBytes()
      }

      yield * map(libp2p._dht.getClosestPeers(bytes, options), mapEvent)
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
 */
const use = async (network, peerId, options) => {
  const net = await network.use(options)
  if (get(net.libp2p, '_config.dht.enabled', false)) {
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
        _dht: {
          get: fn,
          put: fn,
          findProvs: fn,
          findPeer: fn,
          provide: fn,
          query: fn
        }
      }
    }
  }
}
