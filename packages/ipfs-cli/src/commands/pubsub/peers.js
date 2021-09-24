import parseDuration from 'parse-duration'

export default {
  command: 'peers <topic>',

  describe: 'Get all peers subscribed to a topic',

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
    const peers = await ipfs.pubsub.peers(topic, {
      timeout
    })
    peers.forEach(peer => print(peer))
  }
}
