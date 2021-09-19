import * as versionInfo from '../version.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createVersion ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/root').API["version"]}
   */
  async function version (_options = {}) {
    const repoVersion = await repo.version.get()

    return {
      ...versionInfo,
      repo: `${repoVersion}`
    }
  }

  return withTimeoutOption(version)
}
