'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'list',

  describe: 'List all local keys',

  builder: {
    long: {
      alias: 'l',
      describe: 'Show extra information about keys',
      default: false
    }
  },

  handler (argv) {
    argv.ipfs.key.list((err, keys) => {
      if (err) {
        throw err
      }

      if (argv.long) {
        keys.forEach((ki) => print(`${ki.id} ${ki.name}`))
      } else {
        keys.forEach((ki) => print(ki.name))
      }
    })
  }
}
