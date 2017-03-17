'use strict'

const debug = require('debug')
const log = debug('cli:config')
log.error = debug('cli:config:error')
module.exports = {
  command: 'show',

  describe: 'Outputs the content of the config file',

  builder: {},

  handler (argv) {
    if (argv._handled) return
    argv._handled = true

    argv.ipfs.config.get((err, config) => {
      if (err) {
        throw err
      }

      console.log(JSON.stringify(config, null, 4))
    })
  }
}
