'use strict'

const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'local',

  describe: 'List local addresses',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { print, ipfs, isDaemon }, timeout }) {
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }
    const res = await ipfs.swarm.localAddrs({
      timeout
    })
    res.forEach(addr => print(addr.toString()))
  }
}
