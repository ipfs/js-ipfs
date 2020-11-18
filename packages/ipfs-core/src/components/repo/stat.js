'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ repo }) => {
  return withTimeoutOption(async function stat (options) {
    const stats = await repo.stat(options)

    return {
      numObjects: stats.numObjects,
      repoSize: stats.repoSize,
      repoPath: stats.repoPath,
      version: stats.version.toString(),
      storageMax: stats.storageMax
    }
  })
}
