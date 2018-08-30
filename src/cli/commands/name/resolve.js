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
    const opts = {
      nocache: argv.nocache,
      recursive: argv.recursive
    }

    argv.ipfs.name.resolve(argv.name, opts, (err, result) => {
      if (err) {
        throw err
      }

      if (result && result.path) {
        print(result.path)
      } else {
        print(result)
      }
    })
  }
}
