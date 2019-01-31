'use strict'

const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const print = require('../../../utils').print

module.exports = {
  command: 'local',

  describe: 'List local addresses',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      if (!utils.isDaemonOn()) {
        throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
      }
      const ipfs = await argv.getIpfs()
      const res = await ipfs.swarm.localAddrs()
      res.forEach(addr => print(addr.toString()))
    })())
  }
}
