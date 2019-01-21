'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'peers <topic>',

  describe: 'Get all peers subscribed to a topic',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const peers = await argv.ipfs.pubsub.peers(argv.topic)
      peers.forEach(peer => print(peer))
    })())
  }
}
