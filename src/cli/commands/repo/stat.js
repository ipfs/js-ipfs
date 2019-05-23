'use strict'

const print = require('../../utils').print
const humanize = require('../../utils').humanize

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
        stats.repoSize = humanize.Bytes(stats.repoSize)
        stats.storageMax = humanize.Bytes(stats.storageMax)
      }
      print(`repo status
  number of objects: ${stats.numObjects}
  repo size: ${stats.repoSize}
  repo path: ${stats.repoPath}
  version: ${stats.version}
  maximum storage: ${stats.storageMax}`)
    })())
  }
}
