'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'get <key>',

  describe: 'Given a key, query the routing system for its best value.',

  builder: {},

  handler (argv) {
    argv.ipfs.dht.get(argv.key, (err, result) => {
      if (err) {
        throw err
      }

      print(result)
    })
  }
}
