import parseDuration from 'parse-duration'
import { coercePeerId } from '../../utils.js'

export default {
  command: 'bw',

  describe: 'Get bandwidth information.',

  builder: {
    peer: {
      type: 'string',
      coerce: coercePeerId
    },
    proto: {
      type: 'string',
      default: ''
    },
    poll: {
      type: 'boolean',
      default: false
    },
    interval: {
      type: 'string',
      default: '1s',
      coerce: parseDuration
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('@libp2p/interfaces/peer-id').PeerId} argv.peer
   * @param {string} argv.proto
   * @param {boolean} argv.poll
   * @param {number} argv.interval
   * @param {number} argv.timeout
   *
   * @returns {Promise<void>}
   */
  async handler ({ ctx: { ipfs, print }, peer, proto, poll, interval, timeout }) {
    for await (const chunk of ipfs.stats.bw({ peer, proto, poll, interval, timeout })) {
      print(`bandwidth status
  total in: ${chunk.totalIn}B
  total out: ${chunk.totalOut}B
  rate in: ${chunk.rateIn}B/s
  rate out: ${chunk.rateOut}B/s`)
    }
  }
}
