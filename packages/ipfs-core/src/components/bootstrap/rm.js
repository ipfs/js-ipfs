import { isValidMultiaddr } from './utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createRm ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API<{}>["rm"]}
   */
  async function rm (multiaddr, options = {}) {
    if (!isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    const config = await repo.config.getAll(options)
    config.Bootstrap = (config.Bootstrap || []).filter(ma => ma.toString() !== multiaddr.toString())

    await repo.config.replace(config)

    return { Peers: [multiaddr] }
  }

  return withTimeoutOption(rm)
}
