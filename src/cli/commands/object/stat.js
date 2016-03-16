'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Get stats for the DAG node named by <key>',

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

      ipfs.object.stat(mh, (err, stats) => {
        if (err) {
          log.error(err)
          throw err
        }

        delete stats.Hash // only for js-ipfs-api output

        Object.keys(stats).forEach((key) => {
          console.log(`${key}: ${stats[key]}`)
        })
      })
    })
  }
})
