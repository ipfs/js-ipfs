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
  command: 'ls',

  describe: 'Get your list of subscriptions',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const subscriptions = await ipfs.pubsub.ls({
      timeout
    })
    subscriptions.forEach(sub => print(stripControlCharacters(sub)))
  }
}

export default command
