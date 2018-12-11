'use strict'

const print = require('../../utils').print

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

  handler (argv) {
    const { ipfs, key, resolve } = argv
    const opts = {
      maxNumProviders: argv['num-providers']
    }

    resolve((async () => {
      const provs = await ipfs.dht.findProvs(key, opts)

      provs.forEach((element) => {
        print(element.id.toB58String())
      })
    })())
  }
}
