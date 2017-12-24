'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'rm <name>',

  describe: 'Remove a key',

  builder: {},

  handler (argv) {
    argv.ipfs.key.rm(argv.name, (err, res) => {
      if (err) {
        throw err
      }
      res.Keys.forEach((ki) => print(`${ki.Id} ${ki.Name}`))
    })
  }
}
