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
    for await (const peer of libp2p.peerStore.getPeers()) {
      peers.push({
        id: peer.id.toB58String(),
        addrs: peer.addresses.map((mi) => mi.multiaddr)
      })
    }
    return peers
  }

  return withTimeoutOption(addrs)
}
