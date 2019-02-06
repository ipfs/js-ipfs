'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'list',

  describe: 'List all local keys',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const keys = await ipfs.key.list()
      keys.forEach((ki) => print(`${ki.id} ${ki.name}`))
    })())
  }
}
