import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.name
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'rm <name>',

  describe: 'Remove a key',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, name, timeout }) {
    const key = await ipfs.key.rm(name, {
      timeout
    })
    print(`${key.id} ${stripControlCharacters(key.name)}`)
  }
}

export default command
