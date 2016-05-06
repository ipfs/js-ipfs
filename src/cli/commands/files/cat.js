'use strict'

const Command = require('ronin').Command
const debug = require('debug')
const utils = require('../../utils')
const log = debug('cli:files')
log.error = debug('cli:files:error')

module.exports = Command.extend({
  desc: 'Download IPFS objects',

  options: {},

  run: (path, options) => {
    if (!path) {
      throw new Error("Argument 'path' is required")
    }
    if (!options) {
      options = {}
    }
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.files.cat(path, (err, res) => {
        if (err) {
          throw (err)
        }
        if (res) {
          res.on('file', (data) => {
            data.stream.pipe(process.stdout)
          })
        }
        return
      })
    })
  }
})
