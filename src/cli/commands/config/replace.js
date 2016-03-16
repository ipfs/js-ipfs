const Command = require('ronin').Command
const debug = require('debug')
const path = require('path')
const log = debug('cli:config')
log.error = debug('cli:config:error')
const utils = require('utils')

module.exports = Command.extend({
  desc: 'Replaces the config with <file>',

  options: {},

  run: (configPath) => {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      const config = require(path.resolve(process.cwd(), configPath))

      ipfs.config.replace(config, (err, version) => {
        if (err) {
          throw err
        }

        console.log(version)
      })
    })
  }
})
