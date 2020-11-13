'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'peers <topic>',

  describe: 'Get all peers subscribed to a topic',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, topic, timeout }) {
    const peers = await ipfs.pubsub.peers(topic, {
      timeout
    })
    peers.forEach(peer => print(peer))
  }
}
