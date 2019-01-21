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

  handler ({ ipfs, name, recursive, cidBase, resolve }) {
    resolve((async () => {
      const res = await ipfs.resolve(name, { recursive, cidBase })
      print(res)
    })())
  }
}
