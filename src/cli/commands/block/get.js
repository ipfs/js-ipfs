'use strict'

const CID = require('cids')
const print = require('../../utils').print

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {},

  handler (argv) {
    const cid = new CID(argv.key)

    argv.ipfs.block.get(cid, (err, block) => {
      if (err) {
        throw err
      }

      if (argv.onComplete) argv.onComplete()
      print(block.data, false)
    })
  }
}
