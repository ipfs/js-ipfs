'use strict'

const utils = require('../../utils')
const CID = require('cids')
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

      const cid = new CID(argv.key)

      ipfs.block.get(cid, (err, block) => {
        if (err) {
          throw err
        }

        if (block.data) {
          // writing the buffer to stdout seems to be the only way
          // to send out binary data correctly
          process.stdout.write(block.data)
          return
        }

        console.log(block.toString())
      })
    })
  }
}
