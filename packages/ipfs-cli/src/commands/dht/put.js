'use strict'

const { default: parseDuration } = require('parse-duration')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

module.exports = {
  command: 'put <key> <value>',

  describe: 'Write a key/value pair to the routing system.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.key
   * @param {string} argv.value
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs }, key, value, timeout }) {
    await ipfs.dht.put(uint8ArrayFromString(key), uint8ArrayFromString(value), {
      timeout
    })
  }
}
