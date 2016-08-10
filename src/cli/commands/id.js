'use strict'

const debug = require('debug')
const utils = require('../utils')
const log = debug('cli')
log.error = debug('cli:error')

module.exports = {
  command: 'id',

  describe: 'Shows IPFS Node ID info',

  builder: {
    format: {
      alias: 'f',
      type: 'string'
    }
  },

  handler (argv) {
    // TODO: handle argv.format
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.id((err, id) => {
        if (err) {
          throw err
        }

        console.log(JSON.stringify(id, '', 2))
      })
    })
  }
}
