import parseDuration from 'parse-duration'
import { coerceUint8Array } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.topic
 * @property {Uint8Array} Argv.data
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'pub <topic> <data>',

  describe: 'Publish data to a topic',

  builder: {
    data: {
      string: true,
      coerce: coerceUint8Array
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs }, topic, data, timeout }) {
    await ipfs.pubsub.publish(topic, data, {
      timeout
    })
  }
}

export default command
