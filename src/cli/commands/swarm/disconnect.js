'use strict'

const utils = require('../../utils')
const print = require('../../utils').print

module.exports = {
  command: 'disconnect <address>',

  describe: 'Close connection to a given address',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      if (!utils.isDaemonOn()) {
        throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
      }
      const ipfs = await argv.getIpfs()
      const res = await ipfs.swarm.disconnect(argv.address)
      print(res.Strings[0])
    })())
  }
}
