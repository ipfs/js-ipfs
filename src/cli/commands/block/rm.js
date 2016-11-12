'use strict'

const utils = require('../../utils')
const mh = require('multihashes')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

module.exports = {
  command: 'rm <key>',

  describe: 'Remove a raw IPFS block',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      if (utils.isDaemonOn()) {
        // TODO implement this once `js-ipfs-api` supports it
        throw new Error('rm block with daemon running is not yet implemented')
      }

      ipfs.block.del(mh.fromB58String(argv.key), (err) => {
        if (err) {
          throw err
        }

        console.log('removed', argv.key)
      })
    })
  }
}
