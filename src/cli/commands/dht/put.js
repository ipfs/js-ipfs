'use strict'

module.exports = {
  command: 'put <key> <value>',

  describe: 'Write a key/value pair to the routing system.',

  builder: {},

  handler ({ getIpfs, key, value, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      await ipfs.dht.put(key, value)
    })())
  }
}
