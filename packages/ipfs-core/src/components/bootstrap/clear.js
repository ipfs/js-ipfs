import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { multiaddr } from '@multiformats/multiaddr'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createClear ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API<{}>["clear"]}
   */
  async function clear (options = {}) {
    const config = await repo.config.getAll(options)
    const removed = config.Bootstrap || []
    config.Bootstrap = []

    await repo.config.replace(config)

    return { Peers: removed.map(ma => multiaddr(ma)) }
  }

  return withTimeoutOption(clear)
}
