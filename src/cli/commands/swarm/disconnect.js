'use strict'

module.exports = {
  command: 'disconnect <address>',

  describe: 'Close connection to a given address',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      if (!argv.isDaemonOn()) {
        throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
      }
      const ipfs = await argv.getIpfs()
      const res = await ipfs.swarm.disconnect(argv.address)
      argv.print(res.Strings[0])
    })())
  }
}
