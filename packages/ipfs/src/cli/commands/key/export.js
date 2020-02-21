'use strict'

const fs = require('fs')

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
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const pem = await ipfs.key.export(argv.name, argv.passout)
      if (argv.output === 'stdout') {
        process.stdout.write(pem)
      } else {
        fs.writeFileSync(argv.output, pem)
      }
    })())
  }
}
