import parseDuration from 'parse-duration'
import { coerceMultiaddr } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('@multiformats/multiaddr').Multiaddr} Argv.peer
 * @property {boolean} Argv.all
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'rm [<peer>]',

  describe: 'Removes peers from the bootstrap list',

  builder: {
    peer: {
      string: true,
      coerce: coerceMultiaddr
    },
    all: {
      boolean: true,
      describe: 'Remove all bootstrap peers',
      default: false
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
