'use strict'

const multibase = require('multibase')
const parseDuration = require('parse-duration').default
const {
  stripControlCharacters
} = require('../utils')

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
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { print, ipfs }, name, recursive, cidBase, timeout }) {
    const res = await ipfs.resolve(name, { recursive, cidBase, timeout })
    print(stripControlCharacters(res))
  }
}
