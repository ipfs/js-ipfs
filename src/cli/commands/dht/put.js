'use strict'

module.exports = {
  command: 'put <key> <value>',

  describe: 'Write a key/value pair to the routing system.',

  async handler ({ ipfs, key, value }) {
    await ipfs.api.dht.put(key, value)
  }
}
