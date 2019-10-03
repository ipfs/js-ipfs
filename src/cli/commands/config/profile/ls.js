'use strict'

module.exports = {
  command: 'ls',

  describe: 'List available config profiles',

  builder: {},

  handler (argv) {
    argv.resolve(
      (async () => {
        const ipfs = await argv.getIpfs()

        for (const profile of await ipfs.config.profiles.list()) {
          argv.print(`${profile.name}:\n ${profile.description}`)
        }
      })()
    )
  }
}
