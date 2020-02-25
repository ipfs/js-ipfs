'use strict'

module.exports = {
  command: 'peers <topic>',

  describe: 'Get all peers subscribed to a topic',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const peers = await ipfs.pubsub.peers(argv.topic)
    peers.forEach(peer => print(peer))
  }
}
