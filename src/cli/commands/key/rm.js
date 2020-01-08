'use strict'

module.exports = {
  command: 'rm <name>',

  describe: 'Remove a key',

  async handler (argv) {
    const key = await argv.ipfs.api.key.rm(argv.name)
    argv.print(`${key.id} ${key.name}`)
  }
}
