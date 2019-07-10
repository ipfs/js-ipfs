'use strict'

module.exports = {
  command: 'rm <name>',

  describe: 'Remove a key',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const key = await ipfs.key.rm(argv.name)
      argv.print(`${key.id} ${key.name}`)
    })())
  }
}
