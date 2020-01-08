'use strict'

module.exports = {
  command: 'ls',

  describe: 'List available config profiles',

  builder: {},

  async handler ({ ipfs, print }) {
    for (const profile of await ipfs.api.config.profiles.list()) {
      print(`${profile.name}:\n ${profile.description}`)
    }
  }
}
