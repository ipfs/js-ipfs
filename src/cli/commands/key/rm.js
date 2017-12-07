'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'rm <name>',

  describe: 'Remove a key',

  builder: {},

  handler (argv) {
    argv.ipfs.key.rm(argv.name, (err) => {
      if (err) {
        throw err
      }
      print(`removed ${argv.name}`)
    })
  }
}
