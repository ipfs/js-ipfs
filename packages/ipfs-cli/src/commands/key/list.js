import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'list',

  describe: 'List all local keys',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const keys = await ipfs.key.list({
      timeout
    })
    keys.forEach((ki) => print(`${ki.id} ${stripControlCharacters(ki.name)}`))
  }
}

export default command
