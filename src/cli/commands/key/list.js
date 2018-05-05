'use strict'

module.exports = {
  command: 'list',

  describe: 'List all local keys',

  builder: {},

  handler (argv) {
    const print = require('../../utils').print

    argv.ipfs.key.list((err, keys) => {
      if (err) {
        throw err
      }
      keys.forEach((ki) => print(`${ki.id} ${ki.name}`))
    })
  }
}
