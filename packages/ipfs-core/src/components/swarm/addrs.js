import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {Object} config
 * @param {import('../../types').NetworkService} config.network
 */
export function createAddrs ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/swarm').API<{}>["addrs"]}
   */
  async function addrs (options = {}) { // eslint-disable-line require-await
    const peers = []
    const { libp2p } = await network.use(options)
    for (const [peerId, peer] of libp2p.peerStore.peers.entries()) {
      peers.push({
        id: peerId,
        // @ts-ignore - libp2p types are missing
        addrs: peer.addresses.map((mi) => mi.multiaddr)
      })
    }
    return peers
  }

  return withTimeoutOption(addrs)
}
