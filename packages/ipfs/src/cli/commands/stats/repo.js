'use strict'

const parseDuration = require('parse-duration')

module.exports = {
  command: 'repo',

  describe: 'Get stats for the currently used repo',

  builder: {
    human: {
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print } }, human, timeout) {
    const stats = await ipfs.stats.repo({ human, timeout })
    print(`repo status
  number of objects: ${stats.numObjects}
  repo size: ${stats.repoSize}
  repo path: ${stats.repoPath}
  version: ${stats.version}
  maximum storage: ${stats.storageMax}`)
  }
}
