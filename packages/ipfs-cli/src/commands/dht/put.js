import parseDuration from 'parse-duration'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

export default {
  command: 'put <key> <value>',

  describe: 'Write a key/value pair to the routing system.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.key
   * @param {string} argv.value
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs }, key, value, timeout }) {
    await ipfs.dht.put(uint8ArrayFromString(key), uint8ArrayFromString(value), {
      timeout
    })
  }
}
