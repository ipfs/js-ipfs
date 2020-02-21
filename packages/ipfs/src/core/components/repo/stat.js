'use strict'

module.exports = ({ repo }) => {
  return async function stat () {
    const stats = await repo.stat()

    return {
      numObjects: stats.numObjects,
      repoSize: stats.repoSize,
      repoPath: stats.repoPath,
      version: stats.version.toString(),
      storageMax: stats.storageMax
    }
  }
}
