'use strict'

const Command = require('ronin').Command
const IPFS = require('../../../ipfs-core')
const debug = require('debug')
const log = debug('cli:bootstrap')
log.error = debug('cli:bootstrap:error')

module.exports = Command.extend({
  desc: 'Removes peers from the bootstrap list',

  options: {},

  run: (multiaddr) => {
    var node = new IPFS()
    node.bootstrap.rm(multiaddr, (err, list) => {
      if (err) { return log.error(err) }
    })
  }
})
