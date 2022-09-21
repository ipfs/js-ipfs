import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { multiaddr } from '@multiformats/multiaddr'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createList ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API<{}>["list"]}
   */
  async function list (options = {}) {
    /** @type {string[]|null} */
    const peers = (await repo.config.get('Bootstrap', options))
    return { Peers: (peers || []).map(ma => multiaddr(ma)) }
  }

  return withTimeoutOption(list)
}
