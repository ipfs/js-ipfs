'use strict'

const pull = require('pull-stream')
const print = require('../../utils').print

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
    }
  },

  handler ({ ipfs, peer, proto, poll, interval }) {
    const stream = ipfs.stats.bwPullStream({ peer, proto, poll, interval })

    pull(
      stream,
      pull.drain((chunk) => {
        print(`bandwidth status
  total in: ${chunk.totalIn}B
  total out: ${chunk.totalOut}B
  rate in: ${chunk.rateIn}B/s
  rate out: ${chunk.rateOut}B/s`)
      })
    )
  }
}
