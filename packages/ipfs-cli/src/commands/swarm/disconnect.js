import parseDuration from 'parse-duration'
import {
  coerceMultiaddr
} from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('@multiformats/multiaddr').Multiaddr} Argv.address
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'disconnect <address>',

  describe: 'Close connection to a given address',

  builder: {
    address: {
      string: true,
      coerce: coerceMultiaddr
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, isDaemon, print }, address, timeout }) {
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    await ipfs.swarm.disconnect(address, {
      timeout
    })

    print(`${address}`)
  }
}

export default command
