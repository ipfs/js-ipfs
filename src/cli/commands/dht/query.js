'use strict'

module.exports = {
  command: 'query <peerID>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT.',

  builder: {},

  handler ({ getIpfs, print, peerID, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const result = await ipfs.dht.query(peerID)

      result.forEach((peerID) => {
        print(peerID.id.toB58String())
      })
    })())
  }
}
