import defaultConfig from 'ipfs-core-config/config'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { multiaddr } from '@multiformats/multiaddr'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createReset ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API<{}>["reset"]}
   */
  async function reset (options = {}) {
    const config = await repo.config.getAll(options)
    config.Bootstrap = defaultConfig().Bootstrap

    await repo.config.replace(config)

    return {
      Peers: defaultConfig().Bootstrap.map(ma => multiaddr(ma))
    }
  }

  return withTimeoutOption(reset)
}
