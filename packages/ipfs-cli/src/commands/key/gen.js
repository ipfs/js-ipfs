'use strict'

const { default: parseDuration } = require('parse-duration')
const {
  stripControlCharacters
} = require('../../utils')

module.exports = {
  command: 'gen <name>',

  describe: 'Create a new key',

  builder: {
    type: {
      alias: 't',
      describe: 'type of the key to create [rsa, ed25519].',
      default: 'rsa'
    },
    size: {
      alias: 's',
      describe: 'size of the key to generate.',
      default: 2048,
      type: 'number'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.name
   * @param {string} argv.type
   * @param {number} argv.size
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, name, type, size, timeout }) {
    const key = await ipfs.key.gen(name, {
      type,
      size,
      timeout
    })
    print(`generated ${key.id} ${stripControlCharacters(key.name)}`)
  }
}
