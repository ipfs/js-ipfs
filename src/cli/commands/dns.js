'use strict'
const print = require('../utils').print

module.exports = {
  command: 'dns <domain>',

  describe: 'Resolve DNS links',

  builder: {
    format: {
      type: 'string'
    }
  },

  handler (argv) {
    argv.ipfs.dns(argv['domain'], (err, path) => {
      if (err) {
        throw err
      }

      print(path)
    })
  }
}
