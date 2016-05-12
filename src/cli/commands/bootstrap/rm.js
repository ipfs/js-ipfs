'use strict'

const Command = require('ronin').Command
const debug = require('debug')
const log = debug('cli:bootstrap')
log.error = debug('cli:bootstrap:error')
const utils = require('../../utils')

module.exports = Command.extend({
  desc: 'Removes peers from the bootstrap list',

  options: {},

  run: (multiaddr) => {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.bootstrap.rm(multiaddr, (err, list) => {
        if (err) {
          throw err
        }
      })
    })
  }
})
