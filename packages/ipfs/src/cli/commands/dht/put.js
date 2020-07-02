'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'put <key> <value>',

  describe: 'Write a key/value pair to the routing system.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs }, key, value, timeout }) {
    await ipfs.dht.put(key, value, {
      timeout
    })
  }
}
