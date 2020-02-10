'use strict'

module.exports = {
  command: 'rm <name>',

  describe: 'Remove a key',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const key = await ipfs.key.rm(argv.name)
    print(`${key.id} ${key.name}`)
  }
}
