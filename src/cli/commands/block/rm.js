'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

module.exports = Command.extend({
  desc: 'Remove a raw IPFS block',

  options: {},

  run: (key) => {
    if (!key) {
      throw new Error("Argument 'key' is required")
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      if (utils.isDaemonOn()) {
        // TODO implement this once `js-ipfs-api` supports it
        throw new Error('rm block with daemon running is not yet implemented')
      }

      const mh = new Buffer(bs58.decode(key))

      ipfs.block.del(mh, (err) => {
        if (err) {
          throw err
        }

        console.log('removed', key)
      })
    })
  }
})
