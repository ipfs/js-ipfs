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
    const opts = {
      'num-providers': argv['num-providers']
    }

    argv.ipfs.dht.findprovs(argv.key, opts, (err, result) => {
      if (err) {
        throw err
      }

      result.responses.forEach((element) => {
        print(element.id)
      })
    })
  }
}
