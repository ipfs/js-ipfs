'use strict'

const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'local',

  describe: 'List local addresses',

  async handler (argv) {
    if (!argv.ipfs.daemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }
    const res = await argv.ipfs.api.swarm.localAddrs()
    res.forEach(addr => argv.print(addr.toString()))
  }
}
