'use strict'

const Command = require('ronin').Command
const IPFS = require('../../ipfs-core')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')

module.exports = Command.extend({
  desc: 'Shows IPFS version information',

  options: {
    number: {
      alias: 'n',
      type: 'boolean',
      default: false
    },
    commit: {
      type: 'boolean',
      default: false
    },
    repo: {
      type: 'boolean',
      default: false
    }
  },

  run: (name) => {
    var node = new IPFS()
    node.version((err, version) => {
      if (err) { return log.error(err) }

      console.log(version)
    })
  }
})
