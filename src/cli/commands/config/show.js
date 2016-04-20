'use strict'

const Command = require('ronin').Command
const debug = require('debug')
const log = debug('cli:config')
log.error = debug('cli:config:error')
const utils = require('../../utils')

module.exports = Command.extend({
  desc: 'Outputs the content of the config file',

  options: {},

  run: () => {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.config.show((err, config) => {
        if (err) {
          throw err
        }

        console.log(JSON.stringify(config, null, 4))
      })
    })
  }
})
