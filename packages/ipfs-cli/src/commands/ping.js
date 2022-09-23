import parseDuration from 'parse-duration'
import { coercePeerId } from '../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {number} Argv.count
 * @property {import('@libp2p/interface-peer-id').PeerId} Argv.peerId
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'ping <peerId>',

  describe: 'Measure the latency of a connection',

  builder: {
    peerId: {
      describe: 'Specify which peer to ping',
      string: true,
      coerce: coercePeerId
    },
    count: {
      alias: 'n',
      number: true,
      default: 10
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, count, peerId, timeout }) {
    for await (const pong of ipfs.ping(peerId, { count, timeout })) {
      const { success, time, text } = pong
      // Check if it's a pong
      if (success && !text) {
        print(`Pong received: time=${time} ms`)
        // Status response
      } else {
        print(text)
      }
    }
  }
}

export default command
