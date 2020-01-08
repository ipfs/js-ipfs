'use strict'

const multibase = require('multibase')

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

  async handler ({ ipfs, name, recursive, cidBase }) {
    const res = await ipfs.api.resolve(name, { recursive, cidBase })
    return res
  }
}
