'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
// const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: '',

  options: {},

  run: () => {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      // TODO
    })
  }
})
