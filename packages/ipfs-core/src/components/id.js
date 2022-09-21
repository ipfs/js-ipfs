import { ipfsCore as pkgversion } from '../version.js'
import { multiaddr } from '@multiformats/multiaddr'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { NotStartedError } from '../errors.js'
import errCode from 'err-code'
import { logger } from '@libp2p/logger'

const log = logger('ipfs:components:id')

/**
 * @typedef {import('libp2p').Libp2p} Libp2p
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('@libp2p/interface-peer-id').PeerId} PeerId
 */

/**
 * @param {object} config
 * @param {import('@libp2p/interface-peer-id').PeerId} config.peerId
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

      if (peerId.publicKey == null) {
        throw errCode(new Error('Public key missing'), 'ERR_MISSING_PUBLIC_KEY')
      }

      return {
        id: peerId,
        publicKey: uint8ArrayToString(peerId.publicKey, 'base64pad'),
        addresses: [],
        agentVersion: `js-ipfs/${pkgversion}`,
        protocolVersion: '9000',
        protocols: []
      }
    }

    const { libp2p } = net
    const peerIdToId = options.peerId ? options.peerId : peerId
    const peer = await findPeer(peerIdToId, libp2p, options)
    const agentVersion = uint8ArrayToString(peer.metadata.get('AgentVersion') || new Uint8Array())
    const protocolVersion = uint8ArrayToString(peer.metadata.get('ProtocolVersion') || new Uint8Array())
    const idStr = peer.id.toString()
    const publicKeyStr = peer.publicKey ? uint8ArrayToString(peer.publicKey, 'base64pad') : ''

    return {
      id: peerIdToId,
      publicKey: publicKeyStr,
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
        .map(ma => multiaddr(ma)),
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
  let peer = await libp2p.peerStore.get(peerId)

  if (!peer) {
    peer = await findPeerOnDht(peerId, libp2p, options)
  }

  let publicKey = peerId.publicKey ? peerId.publicKey : await libp2p.peerStore.keyBook.get(peerId)

  if (publicKey == null) {
    try {
      publicKey = await libp2p.getPublicKey(peerId, options)
    } catch (err) {
      log.error('Could not load public key for', peerId.toString(), err)
    }
  }

  return {
    ...peer,
    publicKey,
    metadata: peer.metadata || new Map(),
    addresses: peer.addresses.map(addr => addr.multiaddr)
  }
}

/**
 * @param {PeerId} peerId
 * @param {Libp2p} libp2p
 * @param {AbortOptions} options
 */
async function findPeerOnDht (peerId, libp2p, options) {
  if (libp2p.dht == null) {
    throw errCode(new Error('dht not configured'), 'ERR_DHT_NOT_CONFIGURED')
  }

  for await (const event of libp2p.dht.findPeer(peerId, options)) {
    if (event.name === 'FINAL_PEER') {
      break
    }
  }

  const peer = await libp2p.peerStore.get(peerId)

  if (!peer) {
    throw errCode(new Error('Could not find peer'), 'ERR_NOT_FOUND')
  }

  return peer
}
