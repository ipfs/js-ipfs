'use strict'

const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'findpeer <peerId>',

  describe: 'Find the multiaddresses associated with a Peer ID.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, peerId, timeout }) {
    const peer = await ipfs.dht.findPeer(peerId, {
      timeout
    })
    peer.addrs.forEach(addr => print(`${addr}`))
  }
}
