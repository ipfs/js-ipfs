import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../../utils.js'

export default {
  command: 'ls',

  describe: 'Get your list of subscriptions',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, timeout }) {
    const subscriptions = await ipfs.pubsub.ls({
      timeout
    })
    subscriptions.forEach(sub => print(stripControlCharacters(sub)))
  }
}
