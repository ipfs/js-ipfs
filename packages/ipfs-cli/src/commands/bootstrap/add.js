import parseDuration from 'parse-duration'
import { coerceMultiaddr } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('@multiformats/multiaddr').Multiaddr} Argv.peer
 * @property {boolean} Argv.default
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'add [<peer>]',

  describe: 'Add peers to the bootstrap list',

  builder: {
    peer: {
      string: true,
      coerce: coerceMultiaddr
    },
    default: {
      describe: 'Add default bootstrap nodes',
      boolean: true,
      default: false
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
