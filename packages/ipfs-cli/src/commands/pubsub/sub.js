import parseDuration from 'parse-duration'

/**
 * @typedef {import('@libp2p/interface-pubsub').Message} Message
 */

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.topic
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'sub <topic>',

  describe: 'Subscribe to a topic',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
