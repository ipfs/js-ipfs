import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { repoVersion } from 'ipfs-repo/constants'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createVersion ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/repo').API<{}>["version"]}
   */
  async function version (options = {}) {
    try {
      // @ts-expect-error - not a public API
      await repo._checkInitialized(options)
    } catch (/** @type {any} */ err) {
      // TODO: (dryajov) This is really hacky, there must be a better way
      const match = [
        /Key not found in database \[\/version\]/,
        /ENOENT/,
        /repo is not initialized yet/
      ].some((m) => {
        return m.test(err.message)
      })
      if (match) {
        // this repo has not been initialized
        return repoVersion
      }
      throw err
    }

    return repo.version.get()
  }

  return withTimeoutOption(version)
}
