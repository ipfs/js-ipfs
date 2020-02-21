'use strict'

module.exports = {
  command: 'findprovs <key>',

  describe: 'Find peers that can provide a specific value, given a key.',

  builder: {
    'num-providers': {
      alias: 'n',
      describe: 'The number of providers to find. Default: 20.',
      default: 20
    }
  },

  handler ({ getIpfs, key, resolve, print, numProviders }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      for await (const prov of ipfs.dht.findProvs(key, { numProviders })) {
        print(prov.id.toString())
      }
    })())
  }
}
