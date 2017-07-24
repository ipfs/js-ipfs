'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

  builder: {},

  handler (argv) {
    argv.ipfs.bootstrap.list((err, list) => {
      if (err) {
        throw err
      }

      list.Peers.forEach((node) => print(node))
    })
  }
}
