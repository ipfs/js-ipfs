import { ipfsCore as pkgversion } from '../version.js'
import { Multiaddr } from 'multiaddr'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import PeerId from 'peer-id'
import { NotStartedError } from '../errors.js'

/**
 * @param {Object} config
 * @param {import('peer-id')} config.peerId
 * @param {import('../types').NetworkService} config.network
 */
export function createId ({ peerId, network }) {
  /**
   * @type {import('ipfs-core-types/src/root').API["id"]}
   */
  async function id (options = {}) { // eslint-disable-line require-await
    if (options.peerId === peerId.toB58String()) {
      delete options.peerId
    }

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

    const id = options.peerId ? PeerId.createFromB58String(options.peerId.toString()) : peerId
    const { libp2p } = net

    let publicKey = id.pubKey ? id.pubKey : libp2p.peerStore.keyBook.get(id)

    if (!publicKey) {
      publicKey = await libp2p._dht.getPublicKey(id, options)
    }

    const addresses = options.peerId ? libp2p.peerStore.addressBook.getMultiaddrsForPeer(id) : libp2p.multiaddrs
    const protocols = options.peerId ? libp2p.peerStore.protoBook.get(id) : Array.from(libp2p.upgrader.protocols.keys())
    const agentVersion = uint8ArrayToString(libp2p.peerStore.metadataBook.getValue(id, 'AgentVersion') || new Uint8Array())
    const protocolVersion = uint8ArrayToString(libp2p.peerStore.metadataBook.getValue(id, 'ProtocolVersion') || new Uint8Array())
    const idStr = id.toB58String()

    return {
      id: idStr,
      publicKey: uint8ArrayToString(publicKey.bytes, 'base64pad'),
      addresses: (addresses || [])
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
      protocols: (protocols || []).sort()
    }
  }
  return withTimeoutOption(id)
}
