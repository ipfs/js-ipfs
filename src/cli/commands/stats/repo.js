'use strict'

module.exports = {
  command: 'repo',

  describe: 'Get stats for the currently used repo',

  builder: {
    human: {
      type: 'boolean',
      default: false
    }
  },

  async handler (argv) {
    const stats = await argv.ipfs.api.stats.repo({ human: argv.human })
    argv.print(`repo status
  number of objects: ${stats.numObjects}
  repo size: ${stats.repoSize}
  repo path: ${stats.repoPath}
  version: ${stats.version}
  maximum storage: ${stats.storageMax}`)
  }
}
