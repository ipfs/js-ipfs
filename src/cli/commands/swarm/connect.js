'use strict'

const utils = require('../../utils')

module.exports = {
  command: 'connect <address>',

  describe: 'Open connection to a given address',

  builder: {},

  handler (argv) {
    if (!utils.isDaemonOn()) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    argv.ipfs.swarm.connect(argv.address, (err, res) => {
      if (err) {
        throw err
      }

      console.log(res.Strings[0])
    })
  }
}
