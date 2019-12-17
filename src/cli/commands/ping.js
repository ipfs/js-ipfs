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

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()

      for await (const pong of ipfs.ping(argv.peerId, { count: argv.count })) {
        const { success, time, text } = pong
        // Check if it's a pong
        if (success && !text) {
          argv.print(`Pong received: time=${time} ms`)
        // Status response
        } else {
          argv.print(text)
        }
      }
    })())
  }
}
