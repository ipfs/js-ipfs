'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Outputs the raw bytes in an IPFS object',

  options: {},

  run: (key) => {
    if (!key) {
      throw new Error("Argument 'key' is required")
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.object.data(key, {enc: 'base58'}, (err, data) => {
        if (err) {
          throw err
        }

        console.log(data.toString())
      })
    })
  }
})
