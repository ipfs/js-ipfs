'use strict'

module.exports = {
  command: 'get <key>',

  describe: 'Given a key, query the routing system for its best value.',

  async handler ({ ctx, key }) {
    const { ipfs, print } = ctx
    const value = await ipfs.dht.get(key)
    print(value)
  }
}
