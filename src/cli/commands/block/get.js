'use strict'

const utils = require('../../utils')
const mh = require('multihashes')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      const hash = utils.isDaemonOn()
        ? argv.key
        : mh.fromB58String(argv.key)

      ipfs.block.get(hash, (err, block) => {
        if (err) {
          throw err
        }

        if (block.data) {
          console.log(block.data.toString())
          return
        }

        console.log(block.toString())
      })
    })
  }
}
