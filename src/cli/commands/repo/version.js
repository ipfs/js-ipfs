'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  builder: {},

  handler (argv) {
    argv.ipfs.repo.version(function (err, version) {
      if (err) {
        throw err
      }
      print(version)
    })
  }
}
