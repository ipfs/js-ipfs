'use strict'

const Command = require('ronin').Command
const IPFS = require('../../../core')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')
const bs58 = require('bs58')

module.exports = Command.extend({
  desc: 'Add a file to IPFS using the UnixFS data format',

  options: {
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false
    }
  },

  run: (recursive, path) => {
    var node = new IPFS()
    path = process.cwd() + '/' + path
    node.files.add(path, {
      recursive: recursive
    }, (err, stats) => {
      if (err) {
        return console.log(err)
      }
      console.log('added', bs58.encode(stats.Hash).toString(), stats.Name)
    })
  }
})
