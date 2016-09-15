'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'peers',

  describe: 'List peers with open connections',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      if (!utils.isDaemonOn()) {
        throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
      }

      ipfs.swarm.peers((err, res) => {
        if (err) {
          throw err
        }

        res.forEach((addr) => {
          console.log(addr.toString())
        })
      })
    })
  }
}
