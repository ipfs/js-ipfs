'use strict'

module.exports = {
  command: 'peers <topic>',

  describe: 'Get all peers subscribed to a topic',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const peers = await ipfs.pubsub.peers(argv.topic)
      peers.forEach(peer => argv.print(peer))
    })())
  }
}
