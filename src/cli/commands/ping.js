'use strict'

const utils = require('../utils')
const print = require('../utils').print

module.exports = {
  command: 'ping <peerId>',

  description: 'Measure the latency of a connection',

  builder: {
    count: {
      alias: 'n',
      tyoe: 'integer',
      default: 10
    }
  },

  handler (argv) {
    if (!utils.isDaemonOn()) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    const peerId = argv.peerId
    const count = argv.count || 10

    argv.ipfs.ping(peerId, (err, p) => {
      if (err) {
        throw err
      }

      console.log('err', err)
      console.log('p', p)
    })
  }
}
