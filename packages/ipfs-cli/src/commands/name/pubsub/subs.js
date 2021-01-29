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

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const result = await ipfs.name.pubsub.subs({
      timeout
    })
    result.forEach(s => print(stripControlCharacters(s)))
  }
}
