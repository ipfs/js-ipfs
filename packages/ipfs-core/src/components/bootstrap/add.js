import { isValidMultiaddr } from './utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createAdd ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API<{}>["add"]}
   */
  async function add (multiaddr, options = {}) {
    if (!isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    const config = await repo.config.getAll(options)
    const boostrappers = config.Bootstrap || []
    boostrappers.push(multiaddr.toString())

    config.Bootstrap = Array.from(
      new Set(boostrappers)
    ).sort((a, b) => a.localeCompare(b))

    await repo.config.replace(config)

    return {
      Peers: [multiaddr]
    }
  }

  return withTimeoutOption(add)
}
