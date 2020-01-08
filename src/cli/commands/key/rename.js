'use strict'

module.exports = {
  command: 'rename <name> <newName>',

  describe: 'Rename a key',

  async handler (argv) {
    const res = await argv.ipfs.api.key.rename(argv.name, argv.newName)
    argv.print(`renamed to ${res.id} ${res.now}`)
  }
}
