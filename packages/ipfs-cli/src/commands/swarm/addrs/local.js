'use strict'

const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const parseDuration = require('parse-duration').default

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
