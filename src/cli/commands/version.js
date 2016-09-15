'use strict'

const utils = require('../utils')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')

module.exports = {
  command: 'version',

  describe: 'Shows IPFS version information',

  builder: {
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

  handler (argv) {
    // TODO: handle argv.{repo|commit|number}
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.version((err, version) => {
        if (err) {
          throw err
        }

        console.log(`js-ipfs version: ${version.version}`)
      })
    })
  }
}
