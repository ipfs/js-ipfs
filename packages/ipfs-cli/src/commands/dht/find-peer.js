import parseDuration from 'parse-duration'
import { coercePeerId } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('@libp2p/interface-peer-id').PeerId} Argv.peerId
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'findpeer <peerId>',

  describe: 'Find the multiaddresses associated with a Peer ID',

  builder: {
    peerId: {
      string: true,
      coerce: coercePeerId
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
