'use strict'

const utils = require('../../utils')
const bs58 = require('bs58')
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

      const mh = utils.isDaemonOn()
        ? argv.key
        : new Buffer(bs58.decode(argv.key))

      ipfs.block.get(mh, (err, block) => {
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
