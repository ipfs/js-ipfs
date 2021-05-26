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
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {string} argv.domain
   * @param {boolean} argv.recursive
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, domain, recursive, timeout }) {
    const path = await ipfs.dns(domain, { recursive, timeout })
    print(stripControlCharacters(path))
  }
}
