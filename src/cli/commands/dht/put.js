'use strict'

module.exports = {
  command: 'put <key> <value>',

  describe: 'Write a key/value pair to the routing system.',

  builder: {},

  handler (argv) {
    argv.ipfs.dht.put(argv.key, argv.value, (err) => {
      if (err) {
        throw err
      }
    })
  }
}
