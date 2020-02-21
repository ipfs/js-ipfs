'use strict'

const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'local',

  describe: 'List local addresses',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      if (!argv.isDaemonOn()) {
        throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
      }
      const ipfs = await argv.getIpfs()
      const res = await ipfs.swarm.localAddrs()
      res.forEach(addr => argv.print(addr.toString()))
    })())
  }
}
