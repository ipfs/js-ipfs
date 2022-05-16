import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.topic
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'peers <topic>',

  describe: 'Get all peers subscribed to a topic',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, topic, timeout }) {
    const peers = await ipfs.pubsub.peers(topic, {
      timeout
    })
    peers.forEach(peer => print(peer.toString()))
  }
}

export default command
