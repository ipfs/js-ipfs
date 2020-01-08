'use strict'

const debug = require('debug')
const log = debug('cli:config')
log.error = debug('cli:config:error')

module.exports = {
  command: 'show',

  describe: 'Outputs the content of the config file',

  async handler ({ ipfs, print }) {
    const config = await ipfs.api.config.get()
    print(JSON.stringify(config, null, 4))
  }
}
