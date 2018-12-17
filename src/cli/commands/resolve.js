'use strict'

const multibase = require('multibase')
const print = require('../utils').print

module.exports = {
  command: 'resolve <name>',

  description: 'Resolve the value of names to IPFS',

  builder: {
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler (argv) {
    const { recursive, cidBase } = argv
    argv.ipfs.resolve(argv.name, { recursive, cidBase }, (err, res) => {
      if (err) throw err
      print(res)
    })
  }
}
