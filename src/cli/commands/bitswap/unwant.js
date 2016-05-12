'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')

module.exports = Command.extend({
  desc: 'Remove a given block from your wantlist.',

  options: {
    key: {
      required: true
    }
  },

  run: (key) => {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      throw new Error('Not implemented yet')
    })
  }
})
