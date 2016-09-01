'use strict'

const debug = require('debug')
const log = debug('cli:bootstrap')
log.error = debug('cli:bootstrap:error')
const utils = require('../../utils')

module.exports = {
  command: 'rm <peer>',

  describe: 'Removes peers from the bootstrap list',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.bootstrap.rm(argv.peer, (err, list) => {
        if (err) {
          throw err
        }
      })
    })
  }
}
