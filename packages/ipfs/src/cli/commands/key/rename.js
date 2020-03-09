'use strict'

module.exports = {
  command: 'rename <name> <newName>',

  describe: 'Rename a key',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const res = await ipfs.key.rename(argv.name, argv.newName)
    print(`renamed to ${res.id} ${res.now}`)
  }
}
