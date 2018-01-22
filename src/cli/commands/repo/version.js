'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  builder: {},

  handler (argv) {
    argv.ipfs.repo.version((err, resp) => {
      if (err) {
        throw err
      }
      print(resp.version)
    })
  }
}
