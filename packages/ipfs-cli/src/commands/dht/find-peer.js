'use strict'

const { default: parseDuration } = require('parse-duration')
const { coercePeerId } = require('../../utils')

module.exports = {
  command: 'findpeer <peerId>',

  describe: 'Find the multiaddresses associated with a Peer ID.',

  builder: {
    peerId: {
      type: 'string',
      coerce: coercePeerId
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('peer-id')} argv.peerId
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, peerId, timeout }) {
    const peer = await ipfs.dht.findPeer(peerId, {
      timeout
    })
    peer.addrs.forEach(addr => print(`${addr}`))
  }
}
