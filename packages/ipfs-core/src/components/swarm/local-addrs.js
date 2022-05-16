import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('../../types').NetworkService} config.network
 */
export function createLocalAddrs ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/swarm').API<{}>["localAddrs"]}
   */
  async function localAddrs (options = {}) {
    const { libp2p } = await network.use(options)
    return libp2p.getMultiaddrs()
  }

  return withTimeoutOption(localAddrs)
}
