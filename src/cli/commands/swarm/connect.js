'use strict'

module.exports = {
  command: 'connect <address>',

  describe: 'Open connection to a given address',

  async handler (argv) {
    if (!argv.ipfs.daemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }
    const res = await argv.ipfs.api.swarm.connect(argv.address)
    res.forEach(msg => argv.print(msg))
  }
}
