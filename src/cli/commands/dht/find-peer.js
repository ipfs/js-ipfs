'use strict'

module.exports = {
  command: 'findpeer <peerId>',

  describe: 'Find the multiaddresses associated with a Peer ID.',

  async handler ({ ipfs, print, peerId }) {
    const peer = await ipfs.api.dht.findPeer(peerId)
    peer.addrs.forEach(addr => print(`${addr}`))
  }
}
