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

  handler ({ getIpfs, name, recursive, cidBase, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const res = await ipfs.resolve(name, { recursive, cidBase })
      return res
    })())
  }
}
