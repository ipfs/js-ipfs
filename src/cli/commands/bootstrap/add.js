'use strict'

const Command = require('ronin').Command
const IPFS = require('../../../ipfs-core')
const debug = require('debug')
const log = debug('cli:bootstrap')
log.error = debug('cli:bootstrap:error')

module.exports = Command.extend({
  desc: 'Add peers to the bootstrap list',

  options: {},

  run: (multiaddr) => {
    var node = new IPFS()
    node.bootstrap.add(multiaddr, (err, list) => {
      if (err) { return log.error(err) }
    })
  }
})
