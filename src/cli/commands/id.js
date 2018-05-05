'use strict'
module.exports = {
  command: 'id',

  describe: 'Shows IPFS Node ID info',

  builder: {
    format: {
      alias: 'f',
      type: 'string'
    }
  },

  handler (argv) {
    const print = require('../utils').print

    // TODO: handle argv.format
    argv.ipfs.id((err, id) => {
      if (err) {
        throw err
      }

      print(JSON.stringify(id, '', 2))
    })
  }
}
