'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @param {import('.').AbortOptions} [options]
   */
  async function stat (options) {
    const stats = await repo.stat(options)

    return {
      numObjects: stats.numObjects,
      repoSize: stats.repoSize,
      repoPath: stats.repoPath,
      version: stats.version.toString(),
      storageMax: stats.storageMax
    }
  }

  return withTimeoutOption(stat)
}
