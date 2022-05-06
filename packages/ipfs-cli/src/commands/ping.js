import parseDuration from 'parse-duration'
import { coercePeerId } from '../utils.js'

export default {
  command: 'ping <peerId>',

  description: 'Measure the latency of a connection',

  builder: {
    peer: {
      describe: 'Specify which peer to show wantlist for.',
      type: 'string',
      coerce: coercePeerId
    },
    count: {
      alias: 'n',
      type: 'integer',
      default: 10
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {number} argv.count
   * @param {import('@libp2p/interfaces/peer-id').PeerId} argv.peerId
   * @param {number} argv.timeout
   *
   * @returns {Promise<void>}
   */
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
