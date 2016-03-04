'use strict'

const Command = require('ronin').Command
const IPFS = require('../../../ipfs-core')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')

module.exports = Command.extend({
  desc: 'Show peers in the bootstrap list',

  options: {},

  run: (name) => {
    var node = new IPFS()
    node.bootstrap.list((err, list) => {
      if (err) { return log.error(err) }
      list.forEach((node) => {
        console.log(node)
      })
    })
  }
})
