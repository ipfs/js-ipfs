'use strict'

const utils = require('../../utils')

module.exports = {
  command: 'unwant <key>',

  describe: 'Remove a given block from your wantlist.',

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      throw new Error('Not implemented yet')
    })
  }
}
