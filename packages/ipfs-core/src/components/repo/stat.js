'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo')} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {import('ipfs-core-types/src/repo').API["stat"]}
   */
  async function stat (options = {}) {
    const stats = await repo.stat()

    return {
      numObjects: stats.numObjects,
      repoSize: stats.repoSize,
      repoPath: stats.repoPath,
      version: `${stats.version}`,
      storageMax: stats.storageMax
    }
  }

  return withTimeoutOption(stat)
}
