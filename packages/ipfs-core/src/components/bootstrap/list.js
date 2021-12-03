import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { Multiaddr } from 'multiaddr'

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createList ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API<{}>["list"]}
   */
  async function list (options = {}) {
    /** @type {string[]|null} */
    const peers = (await repo.config.get('Bootstrap', options))
    return { Peers: (peers || []).map(ma => new Multiaddr(ma)) }
  }

  return withTimeoutOption(list)
}
