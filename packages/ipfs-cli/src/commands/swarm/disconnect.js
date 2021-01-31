'use strict'

const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'disconnect <address>',

  describe: 'Close connection to a given address',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { print, ipfs, isDaemon }, address, timeout }) {
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }
    const res = await ipfs.swarm.disconnect(address, {
      timeout
    })
    res.forEach(msg => print(msg))
  }
}
