'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'resolve [<name>]',

  describe: 'Resolve IPNS names.',

  builder: {
    format: {
      type: 'string'
    }
  },

  handler (argv) {
    argv.ipfs.name.resolve(argv['name'], (err, result) => {
      if (err) {
        throw err
      }

      print(`result: ${result}`)
    })
  }
}
