'use strict'

module.exports = {
  command: 'provide <key>',

  describe: 'Announce to the network that you are providing given values.',

  builder: {
    recursive: {
      alias: 'r',
      recursive: 'Recursively provide entire graph.',
      default: false
    }
  },

  handler ({ ipfs, key, resolve }) {
    // TODO add recursive option

    resolve((async () => {
      await ipfs.dht.provide(key)
    })())
  }
}
