'use strict'

module.exports = {
  command: 'rm <name>',

  describe: 'Remove a key',

  builder: {},

  handler (argv) {
    const print = require('../../utils').print

    argv.ipfs.key.rm(argv.name, (err, key) => {
      if (err) {
        throw err
      }
      print(`${key.id} ${key.name}`)
    })
  }
}
