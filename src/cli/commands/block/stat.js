'use strict'

const utils = require('../../utils')
const debug = require('debug')
const CID = require('cids')
const log = debug('cli:block')
log.error = debug('cli:block:error')

module.exports = {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) { throw err }
      const cid = new CID(argv.key)

      ipfs.block.stat(cid, (err, stats) => {
        if (err) { throw err }

        console.log('Key:', stats.key)
        console.log('Size:', stats.size)
      })
    })
  }
}
