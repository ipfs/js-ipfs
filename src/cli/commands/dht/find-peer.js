'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'findpeer <peerID>',

  describe: 'Find the multiaddresses associated with a Peer ID.',

  builder: {},

  handler ({ ipfs, peerID, resolve }) {
    resolve((async () => {
      const peers = await ipfs.dht.findPeer(peerID)
      const addresses = peers.multiaddrs.toArray().map((ma) => ma.toString())

      print(addresses)
    })())
  }
}
