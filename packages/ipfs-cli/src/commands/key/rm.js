'use strict'

const { default: parseDuration } = require('parse-duration')
const {
  stripControlCharacters
} = require('../../utils')

module.exports = {
  command: 'rm <name>',

  describe: 'Remove a key',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.name
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, name, timeout }) {
    const key = await ipfs.key.rm(name, {
      timeout
    })
    print(`${key.id} ${stripControlCharacters(key.name)}`)
  }
}
