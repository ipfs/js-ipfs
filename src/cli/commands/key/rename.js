'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'rename <name> <newName>',

  describe: 'Rename a key',

  builder: {},

  handler (argv) {
    argv.ipfs.key.rename(argv.name, argv.newName, (err, res) => {
      if (err) {
        throw err
      }
      print(`renamed to ${res.id} ${res.now}`)
    })
  }
}
