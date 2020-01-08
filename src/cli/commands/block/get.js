'use strict'

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {},

  async handler ({ ipfs, print, key }) {
    const block = await ipfs.api.block.get(key)
    if (block) {
      print(block.data, false)
    } else {
      print('Block was unwanted before it could be remotely retrieved')
    }
  }
}
