'use strict'

const Command = require('ronin').Command
const debug = require('debug')
const log = debug('cli:bootstrap')
const utils = require('../../utils')
log.error = debug('cli:bootstrap:error')

module.exports = Command.extend({
  desc: 'Add peers to the bootstrap list',

  options: {},

  run: (multiaddr) => {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.bootstrap.add(multiaddr, (err, list) => {
        if (err) {
          throw err
        }
      })
    })
  }
})
