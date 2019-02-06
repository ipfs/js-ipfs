'use strict'

const utils = require('../../utils')
const print = utils.print

module.exports = {
  command: 'connect <address>',

  describe: 'Open connection to a given address',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      if (!utils.isDaemonOn()) {
        throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
      }
      const ipfs = await argv.getIpfs()
      const res = await ipfs.swarm.connect(argv.address)
      print(res.Strings[0])
    })())
  }
}
