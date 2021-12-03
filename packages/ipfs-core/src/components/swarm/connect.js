import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {Object} config
 * @param {import('../../types').NetworkService} config.network
 */
export function createConnect ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/swarm').API<{}>["connect"]}
   */
  async function connect (addr, options = {}) {
    const { libp2p } = await network.use(options)
    await libp2p.dial(addr, options)
  }

  return withTimeoutOption(connect)
}
