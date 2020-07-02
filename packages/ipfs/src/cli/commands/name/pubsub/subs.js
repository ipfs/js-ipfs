'use strict'

const parseDuration = require('parse-duration').default

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
    result.forEach(s => print(s))
  }
}
