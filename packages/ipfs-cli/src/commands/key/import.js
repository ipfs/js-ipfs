import fs from 'fs'
import parseDuration from 'parse-duration'

export default {
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
      /**
       * @param {string} input
       */
      coerce: input => fs.readFileSync(input, 'utf8')
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.name
   * @param {string} argv.input
   * @param {string} argv.passin
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, name, input, passin, timeout }) {
    const key = await ipfs.key.import(name, input, passin, {
      timeout
    })
    print(`imported ${key.id} ${key.name}`)
  }
}
