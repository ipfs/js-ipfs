'use strict'

const pull = require('pull-stream')
const print = require('../utils').print

module.exports = {
  command: 'ping <peerId>',

  description: 'Measure the latency of a connection',

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
      pull.drain(({ success, time, text }) => {
        // Check if it's a pong
        if (success && !text) {
          print(`Pong received: time=${time} ms`)
        // Status response
        } else {
          print(text)
        }
      })
    )
  }
}
