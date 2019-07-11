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

  handler ({ getIpfs, print, peer, proto, poll, interval, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()

      return new Promise((resolve, reject) => {
        const stream = ipfs.stats.bwPullStream({ peer, proto, poll, interval })

        const onChunk = chunk => {
          print(`bandwidth status
  total in: ${chunk.totalIn}B
  total out: ${chunk.totalOut}B
  rate in: ${chunk.rateIn}B/s
  rate out: ${chunk.rateOut}B/s`)
        }

        const onEnd = err => {
          if (err) return reject(err)
          resolve()
        }

        pull(stream, pull.drain(onChunk, onEnd))
      })
    })())
  }
}
