'use strict'

module.exports = {
  command: 'get <key>',

  describe: 'Given a key, query the routing system for its best value.',

  async handler ({ ipfs, print, key }) {
    const value = await ipfs.api.dht.get(key)
    print(value)
  }
}
