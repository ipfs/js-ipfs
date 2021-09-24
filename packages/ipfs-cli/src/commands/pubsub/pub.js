import parseDuration from 'parse-duration'
import { coerceUint8Array } from '../../utils.js'

export default {
  command: 'pub <topic> <data>',

  describe: 'Publish data to a topic',

  builder: {
    data: {
      type: 'string',
      coerce: coerceUint8Array
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.topic
   * @param {Uint8Array} argv.data
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs }, topic, data, timeout }) {
    await ipfs.pubsub.publish(topic, data, {
      timeout
    })
  }
}
