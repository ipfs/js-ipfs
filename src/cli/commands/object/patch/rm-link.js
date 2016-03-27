'use strict'

const Command = require('ronin').Command
const utils = require('../../../utils')
const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Remove a link from an object',

  options: {},

  run: (root, link) => {
    if (!root) {
      throw new Error("Argument 'root' is required")
    }
    if (!link) {
      throw new Error("Argument 'link' is required")
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      if (utils.isDaemonOn()) {
        return ipfs.object.patch.rmLink(root, link, (err, obj) => {
          if (err) {
            log.error(err)
            throw err
          }

          console.log(obj.Hash)
        })
      }

      const mh = new Buffer(bs58.decode(root))
      ipfs.object.patch.rmLink(mh, link, (err, obj) => {
        if (err) {
          log.error(err)
          throw err
        }

        console.log(bs58.encode(obj.multihash()).toString())
      })
    })
  }
})
