'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'data <key>',

  describe: 'Outputs the raw bytes in an IPFS object',

  builder: {},

  handler (argv) {
    argv.ipfs.object.data(argv.key, {
      enc: 'base58'
    }, (err, data) => {
      if (err) {
        throw err
      }

      print(data.toString())
    })
  }
}
