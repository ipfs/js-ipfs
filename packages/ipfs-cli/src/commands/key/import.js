import fs from 'fs'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.name
 * @property {string} Argv.input
 * @property {string} Argv.passin
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'import <name>',

  describe: 'Import the key from a PKCS #8 PEM file',

  builder: {
    passin: {
      alias: 'p',
      describe: 'Password for the PEM',
      string: true
    },
    input: {
      alias: 'i',
      describe: 'Input PEM file',
      string: true,
      demandOption: true,
      coerce: input => fs.readFileSync(input, 'utf8')
    },
    timeout: {
      string: true,
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

export default command
