'use strict'

module.exports = {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {},

  handler (argv) {
    const CID = require('cids')
    const print = require('../../utils').print
    argv.ipfs.block.stat(new CID(argv.key), (err, stats) => {
      if (err) {
        throw err
      }

      print('Key: ' + stats.key)
      print('Size: ' + stats.size)
    })
  }
}
