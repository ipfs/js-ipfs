'use strict'

const { default: parseDuration } = require('parse-duration')
const {
  stripControlCharacters
} = require('../../../utils')

module.exports = {
  command: 'subs',

  describe: 'Show current name subscriptions.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../../types').Context} argv.ctx
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, timeout }) {
    const result = await ipfs.name.pubsub.subs({
      timeout
    })
    result.forEach(s => print(stripControlCharacters(s)))
  }
}
