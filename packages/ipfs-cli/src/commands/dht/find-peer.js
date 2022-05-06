import parseDuration from 'parse-duration'
import { coercePeerId } from '../../utils.js'

export default {
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
   * @param {import('@libp2p/interfaces/peer-id').PeerId} argv.peerId
   * @param {number} argv.timeout
   *
   * @returns {Promise<void>}
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
