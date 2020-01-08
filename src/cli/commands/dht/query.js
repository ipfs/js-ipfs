'use strict'

module.exports = {
  command: 'query <peerId>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT.',

  async handler ({ ipfs, print, peerId }) {
    for await (const result of ipfs.api.dht.query(peerId)) {
      print(result.id.toString())
    }
  }
}
