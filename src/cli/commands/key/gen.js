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

  handler (argv) {
    argv.resolve((async () => {
      const opts = {
        type: argv.type,
        size: argv.size
      }
      const ipfs = await argv.getIpfs()
      const key = await ipfs.key.gen(argv.name, opts)
      argv.print(`generated ${key.id} ${key.name}`)
    })())
  }
}
