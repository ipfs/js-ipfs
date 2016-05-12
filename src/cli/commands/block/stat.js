'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

module.exports = Command.extend({
  desc: 'Print information of a raw IPFS block',

  options: {},

  run: (key) => {
    if (!key) {
      throw new Error("Argument 'key' is required")
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      const mh = utils.isDaemonOn()
        ? key
        : new Buffer(bs58.decode(key))

      ipfs.block.stat(mh, (err, block) => {
        if (err) {
          throw err
        }

        if (typeof block.Key !== 'string') {
          block.Key = bs58.encode(block.Key).toString()
        }

        Object.keys(block).forEach((key) => {
          console.log(`${key}: ${block[key]}`)
        })
      })
    })
  }
})
