'use strict'

const print = require('../utils').print

module.exports = {
  command: 'resolve <name>',

  description: 'Resolve the value of names to IPFS',

  builder: {
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false
    }
  },

  handler (argv) {
    argv.ipfs.resolve(argv.name, { recursive: argv.recursive }, (err, res) => {
      if (err) throw err
      print(res)
    })
  }
}
