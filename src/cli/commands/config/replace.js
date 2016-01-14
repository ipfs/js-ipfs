'use strict'

const Command = require('ronin').Command
const IPFS = require('../../../ipfs-core')
const debug = require('debug')
const path = require('path')
const log = debug('cli:version')
log.error = debug('cli:version:error')

module.exports = Command.extend({
  desc: 'Replaces the config with <file>',

  options: {},

  run: (configPath) => {
    var node = new IPFS()
    var config = require(path.resolve(process.cwd(), configPath))

    node.config.replace(config, (err, version) => {
      if (err) { return log.error(err) }

      console.log(version)
    })
  }
})
