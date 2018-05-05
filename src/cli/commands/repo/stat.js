'use strict'

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
    const print = require('../../utils').print

    argv.ipfs.repo.stat({human: argv.human}, (err, stats) => {
      if (err) {
        throw err
      }

      print(`repo status
  number of objects: ${stats.numObjects}
  repo size: ${stats.repoSize}
  repo path: ${stats.repoPath}
  version: ${stats.version}
  maximum storage: ${stats.storageMax}`)
    })
  }
}
