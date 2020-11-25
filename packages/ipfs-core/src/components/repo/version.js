'use strict'

const { repoVersion } = require('ipfs-repo')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * If the repo has been initialized, report the current version.
   * Otherwise report the version that would be initialized.
   *
   * @param {import('.').AbortOptions} options
   * @returns {Promise<number>}
   */
  async function version (options) {
    try {
      // @ts-ignore - not a public API
      await repo._checkInitialized(options)
    } catch (err) {
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

    return repo.version.get(options)
  }

  return withTimeoutOption(version)
}
