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

  async handler ({ ctx, key, numProviders }) {
    const { ipfs, print } = ctx
    for await (const prov of ipfs.dht.findProvs(key, { numProviders })) {
      print(prov.id.toString())
    }
  }
}
