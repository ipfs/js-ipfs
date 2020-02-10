'use strict'

module.exports = {
  command: 'query <peerId>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT.',

  async handler ({ ctx, peerId }) {
    const { ipfs, print } = ctx
    for await (const result of ipfs.dht.query(peerId)) {
      print(result.id.toString())
    }
  }
}
