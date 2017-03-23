'use strict'

const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'local',

  describe: 'List local addresses',

  builder: {},

  handler (argv) {
    if (!utils.isDaemonOn()) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    argv.ipfs.swarm.localAddrs((err, res) => {
      if (err) {
        throw err
      }

      res.forEach((addr) => {
        console.log(addr.toString())
      })
    })
  }
}
