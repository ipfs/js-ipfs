'use strict'

const CID = require('cids')

module.exports = {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {},

  handler (argv) {
    argv.ipfs.block.stat(new CID(argv.key), (err, stats) => {
      if (err) {
        throw err
      }

      console.log('Key:', stats.key)
      console.log('Size:', stats.size)
    })
  }
}
