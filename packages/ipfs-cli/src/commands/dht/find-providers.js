'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'findprovs <key>',

  describe: 'Find peers that can provide a specific value, given a key.',

  builder: {
    'num-providers': {
      alias: 'n',
      describe: 'The number of providers to find. Default: 20.',
      default: 20,
      type: 'number'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, key, numProviders, timeout }) {
    for await (const prov of ipfs.dht.findProvs(key, {
      numProviders,
      timeout
    })) {
      print(prov.id.toString())
    }
  }
}
