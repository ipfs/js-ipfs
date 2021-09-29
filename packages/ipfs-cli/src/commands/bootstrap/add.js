import parseDuration from 'parse-duration'
import { coerceMultiaddr } from '../../utils.js'

export default {
  command: 'add [<peer>]',

  describe: 'Add peers to the bootstrap list',

  builder: {
    peer: {
      type: 'string',
      coerce: coerceMultiaddr
    },
    default: {
      describe: 'Add default bootstrap nodes.',
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('multiaddr').Multiaddr} argv.peer
   * @param {boolean} argv.default
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, peer, default: defaultPeers, timeout }) {
    let list

    if (peer) {
      list = await ipfs.bootstrap.add(peer, {
        timeout
      })
    } else if (defaultPeers) {
      list = await ipfs.bootstrap.reset({
        timeout
      })
    } else {
      throw new Error('Please specify a peer or the --default flag')
    }

    list.Peers.forEach((peer) => print(peer.toString()))
  }
}
