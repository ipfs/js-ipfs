'use strict'

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  builder: {},

  handler (argv) {
    const print = require('../../utils').print

    argv.ipfs.repo.version((err, version) => {
      if (err) {
        throw err
      }

      print(version)
    })
  }
}
