'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'provide <key>',

  describe: 'Announce to the network that you are providing given values.',

  builder: {
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

  async handler ({ ctx: { ipfs }, key, recursive, timeout }) {
    await ipfs.dht.provide(key, {
      recursive,
      timeout
    })
  }
}
