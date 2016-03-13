'use strict'

const Command = require('ronin').Command
const utils = require('../utils')
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
    var ipfs = utils.getIPFS()
    ipfs.version((err, version) => {
      if (err) { return log.error(err) }

      if (typeof version === 'object') { // js-ipfs-api output
        console.log('ipfs version', version.Version)
        return
      }

      console.log('ipfs version', version)
    })
  }
})
