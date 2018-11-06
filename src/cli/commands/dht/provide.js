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

  handler (argv) {
    argv.ipfs.dht.provide(argv.key, (err, result) => {
      if (err) {
        throw err
      }
    })
  }
}
