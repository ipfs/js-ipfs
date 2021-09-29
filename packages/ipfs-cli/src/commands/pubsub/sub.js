import parseDuration from 'parse-duration'

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
   */
  async handler ({ ctx: { ipfs, print }, topic, timeout }) {
    /**
     * @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn}
     */
    const handler = msg => print(msg.data.toString())
    await ipfs.pubsub.subscribe(topic, handler, {
      timeout
    })
  }
}
