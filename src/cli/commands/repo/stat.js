'use strict'

const filesize = require('filesize')

module.exports = {
  command: 'stat',

  describe: 'Get stats for the currently used repo',

  builder: {
    human: {
      type: 'boolean',
      default: false
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const stats = await ipfs.repo.stat()
      if (argv.human) {
        stats.repoSize = filesize(stats.repoSize)
        stats.storageMax = filesize(stats.storageMax)
      }
      return `repo status
  number of objects: ${stats.numObjects}
  repo size: ${stats.repoSize}
  repo path: ${stats.repoPath}
  version: ${stats.version}
  maximum storage: ${stats.storageMax}`
    })())
  }
}
