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
      numObjects: BigInt(stats.numObjects.toString()),
      repoSize: BigInt(stats.repoSize.toString()),
      repoPath: stats.repoPath,
      version: `${stats.version}`,
      storageMax: BigInt(stats.storageMax.toString())
    }
  }

  return withTimeoutOption(stat)
}
