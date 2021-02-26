'use strict'

const { default: parseDuration } = require('parse-duration')
const {
  stripControlCharacters
} = require('../../utils')

module.exports = {
  command: 'rename <name> <newName>',

  describe: 'Rename a key',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, name, newName, timeout }) {
    const res = await ipfs.key.rename(name, newName, {
      timeout
    })
    print(`renamed to ${res.id} ${stripControlCharacters(res.now)}`)
  }
}
