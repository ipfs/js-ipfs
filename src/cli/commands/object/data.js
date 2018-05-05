'use strict'

module.exports = {
  command: 'data <key>',

  describe: 'Outputs the raw bytes in an IPFS object',

  builder: {},

  handler (argv) {
    const print = require('../../utils').print

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
