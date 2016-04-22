'use strict'

const Command = require('ronin').Command
const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'List local addresses',

  options: {},

  run: () => {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      if (!utils.isDaemonOn()) {
        throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
      }

      ipfs.swarm.localAddrs((err, res) => {
        if (err) {
          throw err
        }

        res.Strings.forEach((addr) => {
          console.log(addr)
        })
      })
    })
  }
})
