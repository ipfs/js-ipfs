'use strict'

const utils = require('../../utils')
const CID = require('cids')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

module.exports = {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {},

  handler (argv) {
    const cid = new CID(argv.key)

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.block.stat(cid, (err, stats) => {
        if (err) {
          throw err
        }

        console.log('Key:', stats.key)
        console.log('Size:', stats.size)
      })
    })
  }
}
