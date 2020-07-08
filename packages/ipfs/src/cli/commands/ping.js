'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'ping <peerId>',

  description: 'Measure the latency of a connection',

  builder: {
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
