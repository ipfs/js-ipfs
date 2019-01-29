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

  handler ({ getIpfs, key, recursive, resolve }) {
    const opts = {
      recursive
    }

    resolve((async () => {
      const ipfs = await getIpfs()
      await ipfs.dht.provide(key, opts)
    })())
  }
}
