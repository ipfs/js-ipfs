'use strict'

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

  async handler ({ ctx, count, peerId }) {
    const { ipfs, print } = ctx

    for await (const pong of ipfs.ping(peerId, { count })) {
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
