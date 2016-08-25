'use strict'

const utils = require('../../utils')
const bs58 = require('bs58')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

module.exports = {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.block.stat(argv.key, (err, stats) => {
        if (err) {
          throw err
        }

        console.log('Key:', bs58.encode(stats.key).toString())
        console.log('Size:', stats.size)
      })
    })
  }
}
