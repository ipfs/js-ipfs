'use strict'

const print = require('../utils').print

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
    argv.ipfs.version((err, version) => {
      if (err) {
        throw err
      }

      print(`js-ipfs version: ${version.version}`)
    })
  }
}
