'use strict'

const parseDuration = require('parse-duration').default
const uint8ArrayToString = require('uint8arrays/to-string')

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx, key, timeout }) {
    const { ipfs, print } = ctx
    const block = await ipfs.block.get(key, {
      timeout
    })
    if (block) {
      print(uint8ArrayToString(block.data), false)
    } else {
      print('Block was unwanted before it could be remotely retrieved')
    }
  }
}
