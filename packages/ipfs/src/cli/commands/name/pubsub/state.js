'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'state',

  describe: 'Query the state of IPNS pubsub.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const result = await ipfs.name.pubsub.state({
      timeout
    })
    print(result.enabled ? 'enabled' : 'disabled')
  }
}
