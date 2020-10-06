'use strict'

const fs = require('fs')
const parseDuration = require('parse-duration').default

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
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, name, input, passin, timeout }) {
    const key = await ipfs.key.import(name, input, passin, {
      timeout
    })
    print(`imported ${key.id} ${key.name}`)
  }
}
