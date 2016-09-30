'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'disconnect <address>',

  describe: '',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      // TODO
    })
  }
}
