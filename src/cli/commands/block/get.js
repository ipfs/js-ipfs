'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {},

  handler ({ ipfs, key }) {
    ipfs.block.get(key, (err, block) => {
      if (err) {
        throw err
      }

      if (block) {
        print(block.data, false)
      } else {
        print('Block was unwanted before it could be remotely retrieved')
      }
    })
  }
}
