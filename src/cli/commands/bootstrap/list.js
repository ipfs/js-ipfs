'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const list = await argv.ipfs.bootstrap.list()
      list.Peers.forEach((node) => print(node))
    })())
  }
}
