'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'rename <name> <newName>',

  describe: 'Rename a key',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const res = await argv.ipfs.key.rename(argv.name, argv.newName)
      print(`renamed to ${res.id} ${res.now}`)
    })())
  }
}
