import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @typedef {import('ipfs-core-types/src/swarm').PeersResult} PeersResult
 */

/**
 * @param {object} config
 * @param {import('../../types').NetworkService} config.network
 */
export function createPeers ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/swarm').API<{}>["peers"]}
   */
  async function peers (options = {}) {
    const { libp2p } = await network.use(options)

    if (options.verbose) {
      const peers = []
      for (const connection of libp2p.getConnections()) {
        /** @type {PeersResult} */
        const peer = {
          addr: connection.remoteAddr,
          peer: connection.remotePeer
        }

        if (options.verbose || options.direction) {
          peer.direction = connection.stat.direction
        }

        if (options.verbose) {
          peer.muxer = connection.stat.multiplexer
          peer.latency = 'n/a'
          peer.streams = [] // TODO: get this from libp2p
        }

        peers.push(peer)
      }

      return peers
    }

    /** @type {Map<string, PeersResult>} */
    const peers = new Map()

    for (const connection of libp2p.getConnections()) {
      /** @type {import('ipfs-core-types/src/swarm').PeersResult} */
      const peer = {
        addr: connection.remoteAddr,
        peer: connection.remotePeer
      }

      peers.set(connection.remotePeer.toString(), peer)
    }

    return Array.from(peers.values())
  }

  return withTimeoutOption(peers)
}
