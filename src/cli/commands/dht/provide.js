'use strict'

module.exports = {
  command: 'provide <key>',

  describe: 'Announce to the network that you are providing given values.',

  builder: {
    recursive: {
      alias: 'r',
      recursive: 'Recursively provide entire graph.',
      default: false,
      type: 'boolean'
    }
  },

  async handler ({ ipfs, key, recursive }) {
    await ipfs.dht.provide(key, { recursive })
  }
}
