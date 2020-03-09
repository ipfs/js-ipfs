'use strict'

const prettyBytes = require('pretty-bytes')

module.exports = {
  command: 'stat',

  describe: 'Get stats for the currently used repo',

  builder: {
    human: {
      type: 'boolean',
      alias: 'H',
      default: false
    }
  },

  async handler ({ ctx, human }) {
    const { ipfs, print } = ctx
    const stats = await ipfs.repo.stat()

    if (human) {
      stats.numObjects = stats.numObjects.toNumber()
      stats.repoSize = prettyBytes(stats.repoSize.toNumber()).toUpperCase()
      stats.storageMax = prettyBytes(stats.storageMax.toNumber()).toUpperCase()
    }

    print(
`NumObjects: ${stats.numObjects}
RepoSize: ${stats.repoSize}
StorageMax: ${stats.storageMax}
RepoPath: ${stats.repoPath}
Version: ${stats.version}`)
  }
}
