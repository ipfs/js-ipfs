'use strict'

const pull = require('pull-stream/pull')
const drain = require('pull-stream/sinks/drain')
const pullCatch = require('pull-catch')

const print = require('../utils').print

module.exports = {
  command: 'ping <peerId>',

  describe: 'Measure the latency of a connection',

  builder: {
    count: {
      alias: 'n',
      type: 'integer',
      default: 10
    }
  },

  handler (argv) {
    const peerId = argv.peerId
    const count = argv.count || 10

    pull(
      argv.ipfs.pingPullStream(peerId, { count }),
      pullCatch(err => {
        throw err 
      }),
      drain(({ Time, Text }) => {
        // Check if it's a pong
        if (Time) {
          print(`Pong received: time=${Time} ms`)
        // Status response
        } else {
          print(Text)
        }
      })
    )
  }
}
