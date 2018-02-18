'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'list',

  describe: 'List all local keys',

  builder: {},

  handler (argv) {
    argv.ipfs.key.list((err, keys) => {
      if (err) {
        throw err
      }
      keys.forEach((ki) => print(`${ki.id} ${ki.name}`))
    })
  }
}
