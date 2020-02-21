'use strict'

module.exports = {
  command: 'get <key>',

  describe: 'Given a key, query the routing system for its best value.',

  builder: {},

  handler ({ getIpfs, print, key, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const value = await ipfs.dht.get(key)
      print(value)
    })())
  }
}
