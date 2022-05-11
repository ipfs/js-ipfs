import parseDuration from 'parse-duration'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.key
 * @property {string} Argv.value
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'put <key> <value>',

  describe: 'Write a key/value pair to the routing system',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs }, key, value, timeout }) {
    await ipfs.dht.put(uint8ArrayFromString(key), uint8ArrayFromString(value), {
      timeout
    })
  }
}

export default command
