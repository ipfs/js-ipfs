'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {},

  handler ({ getIpfs, key, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const block = await ipfs.block.get(key)
      if (block) {
        print(block.data, false)
      } else {
        print('Block was unwanted before it could be remotely retrieved')
      }
    })())
  }
}
