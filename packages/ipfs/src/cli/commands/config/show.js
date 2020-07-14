'use strict'

const debug = require('debug')
const log = debug('cli:config')
log.error = debug('cli:config:error')
const parseDuration = require('parse-duration').default

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
    const config = await ipfs.config.getAll({
      timeout
    })
    print(JSON.stringify(config, null, 4))
  }
}
