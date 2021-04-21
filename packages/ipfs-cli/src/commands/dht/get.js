'use strict'

const { default: parseDuration } = require('parse-duration')
const { coerceCID } = require('../../utils')
const uint8ArrayToString = require('uint8arrays/to-string')

module.exports = {
  command: 'get <key>',

  describe: 'Given a key, query the routing system for its best value.',

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
   * @param {import('cids')} argv.key
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, key, timeout }) {
    const value = await ipfs.dht.get(key.bytes, {
      timeout
    })
    print(uint8ArrayToString(value, 'base58btc'))
  }
}
