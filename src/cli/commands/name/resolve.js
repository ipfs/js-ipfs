'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'resolve [<name>]',

  describe: 'Resolve IPNS names.',

  builder: {
    nocache: {
      alias: 'n',
      describe: 'Do not use cached entries. Default: false.',
      default: false
    },
    recursive: {
      alias: 'r',
      recursive: 'Resolve until the result is not an IPNS name. Default: false.',
      default: false
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      const opts = {
        nocache: argv.nocache,
        recursive: argv.recursive
      }

      const result = await argv.ipfs.name.resolve(argv.name, opts)

      if (result && result.path) {
        print(result.path)
      } else {
        print(result)
      }
    })())
  }
}
