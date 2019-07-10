'use strict'

const pull = require('pull-stream')

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

      return new Promise((resolve, reject) => {
        const peerId = argv.peerId
        const count = argv.count || 10
        pull(
          ipfs.pingPullStream(peerId, { count }),
          pull.drain(({ success, time, text }) => {
            // Check if it's a pong
            if (success && !text) {
              argv.print(`Pong received: time=${time} ms`)
            // Status response
            } else {
              argv.print(text)
            }
          }, err => {
            if (err) return reject(err)
            resolve()
          })
        )
      })
    })())
  }
}
