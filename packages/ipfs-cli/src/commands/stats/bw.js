import parseDuration from 'parse-duration'

export default {
  command: 'bw',

  describe: 'Get bandwidth information.',

  builder: {
    peer: {
      type: 'string',
      default: ''
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
   * @param {string} argv.peer
   * @param {string} argv.proto
   * @param {boolean} argv.poll
   * @param {number} argv.interval
   * @param {number} argv.timeout
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
