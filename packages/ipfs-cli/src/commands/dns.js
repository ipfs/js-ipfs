'use strict'

const { default: parseDuration } = require('parse-duration')
const {
  stripControlCharacters
} = require('../utils')

module.exports = {
  command: 'dns <domain>',

  describe: 'Resolve DNS links',

  builder: {
    recursive: {
      type: 'boolean',
      default: true,
      alias: 'r',
      desc: 'Resolve until the result is not a DNS link'
    },
    format: {
      type: 'string'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, domain, recursive, format, timeout }) {
    const path = await ipfs.dns(domain, { recursive, format, timeout })
    print(stripControlCharacters(path))
  }
}
