import { ipfsCore as pkgversion } from '../version.js'
import { Multiaddr } from 'multiaddr'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import PeerId from 'peer-id'
import { NotStartedError } from '../errors.js'
import errCode from 'err-code'

/**
 * @typedef {import('libp2p')} Libp2p
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

/**
 * @param {Object} config
 * @param {import('peer-id')} config.peerId
 * @param {import('../types').NetworkService} config.network
 */
export function createId ({ peerId, network }) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["id"]}
   */
  async function id (options = {}) { // eslint-disable-line require-await
    const net = network.try()

    if (!net) {
      if (options.peerId) {
        throw new NotStartedError()
      }

      const idStr = peerId.toB58String()

      return {
        id: idStr,
        publicKey: uint8ArrayToString(peerId.pubKey.bytes, 'base64pad'),
        addresses: [],
        agentVersion: `js-ipfs/${pkgversion}`,
        protocolVersion: '9000',
        protocols: []
      }
    }

    const { libp2p } = net
    const peerIdToId = options.peerId ? PeerId.parse(options.peerId) : peerId
    const peer = await findPeer(peerIdToId, libp2p, options)
    const agentVersion = uint8ArrayToString(peer.metadata.get('AgentVersion') || new Uint8Array())
    const protocolVersion = uint8ArrayToString(peer.metadata.get('ProtocolVersion') || new Uint8Array())
    const idStr = peer.id.toB58String()

    return {
      id: idStr,
      publicKey: uint8ArrayToString(peer.publicKey.bytes, 'base64pad'),
      addresses: (peer.addresses || [])
        .map(ma => {
          const str = ma.toString()

          // some relay-style transports add our peer id to the ma for us
          // so don't double-add
          if (str.endsWith(`/p2p/${idStr}`)) {
            return str
          }

          return `${str}/p2p/${idStr}`
        })
        .sort()
        .map(ma => new Multiaddr(ma)),
      agentVersion,
      protocolVersion,
      protocols: (peer.protocols || []).sort()
    }
  }
  return withTimeoutOption(id)
}

/**
 * @param {PeerId} peerId
 * @param {Libp2p} libp2p
 * @param {AbortOptions} options
 */
async function findPeer (peerId, libp2p, options) {
  let peer = libp2p.peerStore.get(peerId)

  if (!peer) {
    peer = await findPeerOnDht(peerId, libp2p, options)
  }

  let publicKey = peerId.pubKey ? peerId.pubKey : libp2p.peerStore.keyBook.get(peerId)

  if (!publicKey) {
    publicKey = await libp2p._dht.getPublicKey(peerId, options)
  }

  return {
    ...peer,
    publicKey,
    metadata: peer.metadata || new Map(),
    addresses: peer.addresses.map(addr => addr.multiaddr)
  }
}

/**
 *
 * @param {PeerId} peerId
 * @param {Libp2p} libp2p
 * @param {AbortOptions} options
 */
async function findPeerOnDht (peerId, libp2p, options) {
  for await (const event of libp2p._dht.findPeer(peerId, options)) {
    if (event.name === 'FINAL_PEER') {
      break
    }
  }

  const peer = libp2p.peerStore.get(peerId)

  if (!peer) {
    throw errCode(new Error('Could not find peer'), 'ERR_NOT_FOUND')
  }

  return peer
}
