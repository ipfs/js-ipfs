import parseDuration from 'parse-duration'
import { coerceMultiaddr } from '../../utils.js'

export default {
  command: 'rm [<peer>]',

  describe: 'Removes peers from the bootstrap list',

  builder: {
    peer: {
      type: 'string',
      coerce: coerceMultiaddr
    },
    all: {
      type: 'boolean',
      describe: 'Remove all bootstrap peers.',
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
   * @param {boolean} argv.all
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, all, peer, timeout }) {
    let list

    if (peer) {
      list = await ipfs.bootstrap.rm(peer, {
        timeout
      })
    } else if (all) {
      list = await ipfs.bootstrap.clear({
        timeout
      })
    } else {
      throw new Error('Please specify a peer or the --all flag')
    }

    list.Peers.forEach((peer) => print(peer.toString()))
  }
}
