'use strict'

module.exports = {
  command: 'put <key> <value>',

  describe: 'Write a key/value pair to the routing system.',

  builder: {},

  handler ({ ipfs, key, value, resolve }) {
    resolve((async () => {
      await ipfs.dht.put(key, value)
    })())
  }
}
