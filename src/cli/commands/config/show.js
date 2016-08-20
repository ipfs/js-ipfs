'use strict'

const debug = require('debug')
const log = debug('cli:config')
log.error = debug('cli:config:error')
const utils = require('../../utils')

module.exports = {
  command: 'show',

  describe: 'Outputs the content of the config file',

  builder: {},

  handler (argv) {
    if (argv._handled) return
    argv._handled = true

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.config.get((err, config) => {
        if (err) {
          throw err
        }

        console.log(JSON.stringify(config, null, 4))
      })
    })
  }
}
