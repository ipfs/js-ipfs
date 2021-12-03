import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { Multiaddr } from 'multiaddr'

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createClear ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API<{}>["clear"]}
   */
  async function clear (options = {}) {
    /** @type {import('ipfs-core-types/src/config').Config} */
    // @ts-ignore repo returns type unknown
    const config = await repo.config.getAll(options)
    const removed = config.Bootstrap || []
    config.Bootstrap = []

    await repo.config.replace(config)

    return { Peers: removed.map(ma => new Multiaddr(ma)) }
  }

  return withTimeoutOption(clear)
}
