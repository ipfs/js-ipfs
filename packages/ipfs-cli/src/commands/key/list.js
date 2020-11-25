'use strict'

const parseDuration = require('parse-duration').default
const {
  stripControlCharacters
} = require('../../utils')

module.exports = {
  command: 'list',

  describe: 'List all local keys',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const keys = await ipfs.key.list({
      timeout
    })
    keys.forEach((ki) => print(`${ki.id} ${stripControlCharacters(ki.name)}`))
  }
}
