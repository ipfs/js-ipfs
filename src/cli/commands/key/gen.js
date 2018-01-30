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
    const opts = {
      type: argv.type,
      size: argv.size
    }
    argv.ipfs.key.gen(argv.name, opts, (err, key) => {
      if (err) {
        throw err
      }
      print(`generated ${key.id} ${key.name}`)
    })
  }
}
