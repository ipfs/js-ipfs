'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'get <key>',

  describe: 'Given a key, query the routing system for its best value.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, key, timeout }) {
    const value = await ipfs.dht.get(key, {
      timeout
    })
    print(value)
  }
}
