'use strict'

const { default: parseDuration } = require('parse-duration')
const { coerceCID } = require('../../utils')

module.exports = {
  command: 'provide <key>',

  describe: 'Announce to the network that you are providing given values.',

  builder: {
    key: {
      type: 'string',
      coerce: coerceCID
    },
    recursive: {
      alias: 'r',
      recursive: 'Recursively provide entire graph.',
      default: false,
      type: 'boolean'
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
   * @param {boolean} argv.recursive
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs }, key, recursive, timeout }) {
    await ipfs.dht.provide(key, {
      recursive,
      timeout
    })
  }
}
