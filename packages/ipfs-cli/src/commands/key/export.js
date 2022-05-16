import fs from 'fs'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.name
 * @property {string} Argv.passout
 * @property {string} Argv.output
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'export <name>',

  describe: 'Export the key as a password protected PKCS #8 PEM file',

  builder: {
    passout: {
      alias: 'p',
      describe: 'Password for the PEM',
      string: true,
      demandOption: true
    },
    output: {
      alias: 'o',
      describe: 'Output file',
      string: true,
      default: 'stdout'
    },
    timeout: {
      string: true,
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

export default command
