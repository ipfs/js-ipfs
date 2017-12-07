'use strict'

const print = require('../../utils').print

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
      default: '2048'
    }
  },

  handler (argv) {
    argv.ipfs.key.generate(argv.name, argv.type, argv.size, (err, key) => {
      if (err) {
        throw err
      }
      print(`generated ${key.name} ${key.id}`)
    })
  }
}
