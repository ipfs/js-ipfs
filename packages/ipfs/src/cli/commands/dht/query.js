'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'query <peerId>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, peerId, timeout }) {
    for await (const result of ipfs.dht.query(peerId, {
      timeout
    })) {
      print(result.id.toString())
    }
  }
}
