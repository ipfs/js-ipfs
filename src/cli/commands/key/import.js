'use strict'

const fs = require('fs')

module.exports = {
  command: 'import <name>',

  describe: 'Import the key from a PKCS #8 PEM file',

  builder: {
    passin: {
      alias: 'p',
      describe: 'Password for the PEM',
      type: 'string'
    },
    input: {
      alias: 'i',
      describe: 'Input PEM file',
      type: 'string',
      demandOption: true,
      coerce: ('input', input => fs.readFileSync(input, 'utf8'))
    }
  },

  handler (argv) {
    const print = require('../../utils').print

    argv.ipfs.key.import(argv.name, argv.input, argv.passin, (err, key) => {
      if (err) {
        throw err
      }
      print(`imported ${key.id} ${key.name}`)
    })
  }
}
