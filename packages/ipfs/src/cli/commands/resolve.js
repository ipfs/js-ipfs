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

  async handler ({ ctx, name, recursive, cidBase }) {
    const { ipfs } = ctx

    const res = await ipfs.resolve(name, { recursive, cidBase })
    return res
  }
}
