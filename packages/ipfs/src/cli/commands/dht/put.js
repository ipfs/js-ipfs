'use strict'

module.exports = {
  command: 'put <key> <value>',

  describe: 'Write a key/value pair to the routing system.',

  async handler ({ ctx, key, value }) {
    const { ipfs } = ctx
    await ipfs.dht.put(key, value)
  }
}
