'use strict'

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

      for await (const chunk of ipfs.stats.bw({ peer, proto, poll, interval })) {
        print(`bandwidth status
  total in: ${chunk.totalIn}B
  total out: ${chunk.totalOut}B
  rate in: ${chunk.rateIn}B/s
  rate out: ${chunk.rateOut}B/s`)
      }
    })())
  }
}
