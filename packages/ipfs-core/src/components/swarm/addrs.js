import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @typedef {import('ipfs-core-types/src/swarm').AddrsResult} AddrsResult
 */

/**
 * @param {object} config
 * @param {import('../../types').NetworkService} config.network
 */
export function createAddrs ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/swarm').API<{}>["addrs"]}
   */
  async function addrs (options = {}) { // eslint-disable-line require-await
    /** @type {AddrsResult[]} */
    const peers = []
    const { libp2p } = await network.use(options)

    await libp2p.peerStore.forEach(peer => {
      peers.push({
        id: peer.id,
        addrs: peer.addresses.map((mi) => mi.multiaddr)
      })
    })

    return peers
  }

  return withTimeoutOption(addrs)
}
