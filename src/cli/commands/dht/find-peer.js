'use strict'

module.exports = {
  command: 'findpeer <peerID>',

  describe: 'Find the multiaddresses associated with a Peer ID.',

  builder: {},

  handler ({ getIpfs, print, peerID, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const peers = await ipfs.dht.findPeer(peerID)
      const addresses = peers.multiaddrs.toArray().map((ma) => ma.toString())
      addresses.forEach((addr) => print(addr))
    })())
  }
}
