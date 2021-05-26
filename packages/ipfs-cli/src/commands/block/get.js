'use strict'

const { default: parseDuration } = require('parse-duration')
const uint8ArrayToString = require('uint8arrays/to-string')
const { coerceCID } = require('../../utils')

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {
    key: {
      type: 'string',
      coerce: coerceCID
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.key
   * @param {number} argv.timeout
   */
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
