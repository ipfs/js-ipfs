'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'disconnect <address>',

  describe: 'Close connection to a given address',

  builder: {},

  handler (argv) {
    if (!utils.isDaemonOn()) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.swarm.disconnect(argv.address, (err, res) => {
        if (err) {
          throw err
        }

        console.log(res.Strings[0])
      })
    })
  }
}
