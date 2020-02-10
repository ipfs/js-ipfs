'use strict'

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
    }
  },

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const opts = {
      type: argv.type,
      size: argv.size
    }
    const key = await ipfs.key.gen(argv.name, opts)
    print(`generated ${key.id} ${key.name}`)
  }
}
