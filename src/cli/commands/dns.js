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

  handler ({ ipfs, domain }) {
    ipfs.dns(domain, (err, path) => {
      if (err) {
        throw err
      }

      print(path)
    })
  }
}
