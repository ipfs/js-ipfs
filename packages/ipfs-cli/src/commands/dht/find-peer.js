import parseDuration from 'parse-duration'

export default {
  command: 'findpeer <peerId>',

  describe: 'Find the multiaddresses associated with a Peer ID.',

  builder: {
    peerId: {
      type: 'string'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.peerId
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, peerId, timeout }) {
    for await (const event of ipfs.dht.findPeer(peerId, {
      timeout
    })) {
      if (event.name === 'FINAL_PEER') {
        event.peer.multiaddrs.forEach(addr => print(`${addr}`))
      }
    }
  }
}
