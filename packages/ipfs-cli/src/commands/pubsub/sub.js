import parseDuration from 'parse-duration'

/**
 * @typedef {import('@libp2p/interfaces/pubsub').Message} Message
 */

export default {
  command: 'sub <topic>',

  describe: 'Subscribe to a topic',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.topic
   * @param {number} argv.timeout
   *
   * @returns {Promise<void>}
   */
  async handler ({ ctx: { ipfs, print }, topic, timeout }) {
    /**
     * @type {import('@libp2p/interfaces/events').EventHandler<Message>}
     */
    const handler = msg => print(msg.data.toString())
    await ipfs.pubsub.subscribe(topic, handler, {
      timeout
    })
  }
}
