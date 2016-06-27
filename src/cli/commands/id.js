'use strict'

const Command = require('ronin').Command
const debug = require('debug')
const utils = require('../utils')
const log = debug('cli')
log.error = debug('cli:error')

module.exports = Command.extend({
  desc: 'Shows IPFS Node ID info',

  options: {
    format: {
      alias: 'f',
      type: 'string'
    }
  },

  run: (name) => {
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
})
