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

  async handler ({ ctx: { ipfs, print }, name, timeout }) {
    const key = await ipfs.key.rm(name, {
      timeout
    })
    print(`${key.id} ${stripControlCharacters(key.name)}`)
  }
}
