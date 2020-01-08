'use strict'

module.exports = {
  command: 'peers <topic>',

  describe: 'Get all peers subscribed to a topic',

  async handler (argv) {
    const peers = await argv.ipfs.api.pubsub.peers(argv.topic)
    peers.forEach(peer => argv.print(peer))
  }
}
