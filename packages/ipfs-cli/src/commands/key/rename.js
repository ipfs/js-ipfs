'use strict'

const parseDuration = require('parse-duration').default

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
    print(`renamed to ${res.id} ${res.now}`)
  }
}
