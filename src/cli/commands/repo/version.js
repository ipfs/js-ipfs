'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  builder: {},

  handler (argv) {
    console.log('cli/commands/repo/version:', argv.ipfs.repo, '\n')
    argv.ipfs.repo.version(function (err, version) {
      if (err) {
        throw err
      }
      print(version.version)
    })
  }
}
