'use strict'

module.exports = {
  command: 'ls',

  describe: 'List available config profiles',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    for (const profile of await ipfs.config.profiles.list()) {
      print(`${profile.name}:\n ${profile.description}`)
    }
  }
}
