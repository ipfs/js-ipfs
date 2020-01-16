'use strict'

module.exports = {
  command: 'query <peerId>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT.',

  builder: {},

  handler ({ getIpfs, print, peerId, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      for await (const result of ipfs.dht.query(peerId)) {
        print(result.id.toString())
      }
    })())
  }
}
