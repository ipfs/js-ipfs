'use strict'

module.exports = {
  command: 'findpeer <peerId>',

  describe: 'Find the multiaddresses associated with a Peer ID.',

  builder: {},

  handler ({ getIpfs, print, peerId, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const peer = await ipfs.dht.findPeer(peerId)
      peer.addrs.forEach(addr => print(`${addr}`))
    })())
  }
}
