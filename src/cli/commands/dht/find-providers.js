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

  handler (argv) {
    const { getIpfs, key, resolve } = argv
    const opts = {
      maxNumProviders: argv['num-providers']
    }

    resolve((async () => {
      const ipfs = await getIpfs()
      const provs = await ipfs.dht.findProvs(key, opts)

      provs.forEach((element) => {
        argv.print(element.id.toB58String())
      })
    })())
  }
}
