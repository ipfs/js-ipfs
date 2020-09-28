'use strict'

const parseDuration = require('parse-duration').default

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

  async handler ({ ctx: { ipfs, print }, name, type, size, timeout }) {
    const key = await ipfs.key.gen(name, {
      type,
      size,
      timeout
    })
    print(`generated ${key.id} ${key.name}`)
  }
}
