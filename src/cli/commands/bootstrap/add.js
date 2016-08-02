'use strict'

const debug = require('debug')
const log = debug('cli:bootstrap')
const utils = require('../../utils')
log.error = debug('cli:bootstrap:error')

module.exports = {
  command: 'add <peer>',

  describe: 'Add peers to the bootstrap list',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.bootstrap.add(argv.peer, (err, list) => {
        if (err) {
          throw err
        }
      })
    })
  }
}
