import { ipfsCore, interfaceIpfsCore, commit } from '../version.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createVersion ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["version"]}
   */
  async function version (_options = {}) {
    const repoVersion = await repo.version.get()

    return {
      version: ipfsCore,
      commit,
      repo: `${repoVersion}`,
      'ipfs-core': ipfsCore,
      'interface-ipfs-core': interfaceIpfsCore
    }
  }

  return withTimeoutOption(version)
}
