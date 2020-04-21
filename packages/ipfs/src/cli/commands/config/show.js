'use strict'

const debug = require('debug')
const log = debug('cli:config')
log.error = debug('cli:config:error')
const parseDuration = require('parse-duration')

module.exports = {
  command: 'show',

  describe: 'Outputs the content of the config file',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const config = await ipfs.config.get({
      timeout
    })
    print(JSON.stringify(config, null, 4))
  }
}
