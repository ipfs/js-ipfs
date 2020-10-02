'use strict'

const parseDuration = require('parse-duration').default

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
    print(`${key.id} ${key.name}`)
  }
}
