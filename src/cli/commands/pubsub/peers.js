'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'peers <topic>',

  describe: 'Get all peers subscribed to a topic',

  builder: {},

  handler (argv) {
    argv.ipfs.pubsub.peers(argv.topic, (err, peers) => {
      if (err) {
        throw err
      }

      peers.forEach((peer) => print(peer))
    })
  }
}
