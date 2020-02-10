'use strict'

module.exports = {
  command: 'findpeer <peerId>',

  describe: 'Find the multiaddresses associated with a Peer ID.',

  async handler ({ ctx, peerId }) {
    const { ipfs, print } = ctx
    const peer = await ipfs.dht.findPeer(peerId)
    peer.addrs.forEach(addr => print(`${addr}`))
  }
}
