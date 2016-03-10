'use strict'

const Command = require('ronin').Command
const IPFS = require('../../../ipfs-core')
const debug = require('debug')
const log = debug('cli:config')
log.error = debug('cli:config:error')

module.exports = Command.extend({
  desc: 'Outputs the content of the config file',

  options: {},

  run: () => {
    var node = new IPFS()
    node.config.show((err, config) => {
      if (err) { return log.error(err) }

      console.log(JSON.stringify(config, null, 4))
    })
  }
})
