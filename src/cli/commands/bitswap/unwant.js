'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'unwant <key>',

  describe: 'Removes a given block from your wantlist.',

  builder: {
    key: {
      alias: 'k',
      describe: 'Key to remove from your wantlist',
      type: 'string'
    }
  },
  handler (argv) {
    argv.ipfs.bitswap.unwant(argv.key, (err) => {
      if (err) {
        throw err
      }
      print(`Key ${argv.key} removed from wantlist`)
    })
  }
}
