'use strict'

module.exports = {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

  builder: {},

  handler (argv) {
    const print = require('../../utils').print

    argv.ipfs.bootstrap.list((err, list) => {
      if (err) {
        throw err
      }

      list.Peers.forEach((node) => print(node))
    })
  }
}
