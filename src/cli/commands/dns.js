'use strict'
module.exports = {
  command: 'dns <domain>',

  describe: 'Resolve DNS links',

  builder: {
    format: {
      type: 'string'
    }
  },

  handler (argv) {
    const print = require('../utils').print

    argv.ipfs.dns(argv['domain'], (err, path) => {
      if (err) {
        throw err
      }

      print(path)
    })
  }
}
