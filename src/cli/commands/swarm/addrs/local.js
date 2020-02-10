'use strict'

const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'local',

  describe: 'List local addresses',

  async handler ({ ctx }) {
    const { print, ipfs, isDaemon } = ctx
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }
    const res = await ipfs.swarm.localAddrs()
    res.forEach(addr => print(addr.toString()))
  }
}
