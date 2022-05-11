import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.name
 * @property {string} Argv.newName
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'rename <name> <newName>',

  describe: 'Rename a key',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, name, newName, timeout }) {
    const res = await ipfs.key.rename(name, newName, {
      timeout
    })
    print(`renamed to ${res.id} ${stripControlCharacters(res.now)}`)
  }
}

export default command
