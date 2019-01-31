'use strict'
const print = require('../utils').print

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
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const id = await ipfs.id()
      print(JSON.stringify(id, '', 2))
    })())
  }
}
