'use strict'

const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'cancel <name>',

  describe: 'Cancel a name subscription.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, name, timeout }) {
    const result = await ipfs.name.pubsub.cancel(name, {
      timeout
    })
    print(result.canceled ? 'canceled' : 'no subscription')
  }
}
