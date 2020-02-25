'use strict'

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {},

  async handler ({ ctx, key }) {
    const { ipfs, print } = ctx
    const block = await ipfs.block.get(key)
    if (block) {
      print(block.data, false)
    } else {
      print('Block was unwanted before it could be remotely retrieved')
    }
  }
}
