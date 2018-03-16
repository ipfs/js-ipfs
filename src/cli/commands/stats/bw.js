'use strict'

const pull = require('pull-stream')

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

  handler (argv) {
    const stream = argv.ipfs.stats.bwPullStream({
      peer: argv.peer,
      proto: argv.proto,
      poll: argv.poll,
      interval: argv.interval
    })

    pull(
      stream,
      pull.drain((chunk) => {
        console.log(`bandwidth status
  total in: ${chunk.totalIn}B
  total out: ${chunk.totalOut}B
  rate in: ${chunk.rateIn}B/s
  rate out: ${chunk.rateOut}B/s`)
      })
    )
  }
}
