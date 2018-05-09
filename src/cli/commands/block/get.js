'use strict'

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {},

  handler (argv) {
    const CID = require('cids')
    const cid = new CID(argv.key)

    argv.ipfs.block.get(cid, (err, block) => {
      if (err) {
        throw err
      }

      process.stdout.write(block.data)
    })
  }
}
