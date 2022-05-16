import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('../../types').NetworkService} config.network
 */
export function createDisconnect ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/swarm').API<{}>["disconnect"]}
   */
  async function disconnect (addr, options = {}) {
    const { libp2p } = await network.use(options)
    await libp2p.hangUp(addr)
  }

  return withTimeoutOption(disconnect)
}
