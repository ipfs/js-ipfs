'use strict'

const fs = require('fs')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'export <name>',

  describe: 'Export the key as a password protected PKCS #8 PEM file',

  builder: {
    passout: {
      alias: 'p',
      describe: 'Password for the PEM',
      type: 'string',
      demandOption: true
    },
    output: {
      alias: 'o',
      describe: 'Output file',
      type: 'string',
      default: 'stdout'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx, name, passout, output, timeout }) {
    const { ipfs } = ctx
    const pem = await ipfs.key.export(name, passout, {
      timeout
    })
    if (output === 'stdout') {
      process.stdout.write(pem)
    } else {
      fs.writeFileSync(output, pem)
    }
  }
}
