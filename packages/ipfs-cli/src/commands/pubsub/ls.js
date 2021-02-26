'use strict'

const { default: parseDuration } = require('parse-duration')
const {
  stripControlCharacters
} = require('../../utils')

module.exports = {
  command: 'ls',

  describe: 'Get your list of subscriptions',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const subscriptions = await ipfs.pubsub.ls({
      timeout
    })
    subscriptions.forEach(sub => print(stripControlCharacters(sub)))
  }
}
