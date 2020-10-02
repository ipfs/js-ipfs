'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
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
      default: '1s'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

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
