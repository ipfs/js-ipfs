'use strict'

module.exports = {
  command: 'findprovs <key>',

  describe: 'Find peers that can provide a specific value, given a key.',

  builder: {
    'num-providers': {
      alias: 'n',
      describe: 'The number of providers to find. Default: 20.',
      default: 20,
      type: 'number'
    }
  },

  async handler ({ ipfs, key, print, numProviders }) {
    for await (const prov of ipfs.api.dht.findProvs(key, { numProviders })) {
      print(prov.id.toString())
    }
  }
}
