'use strict'

const utils = require('../../utils')

module.exports = {
  command: 'disconnect <address>',

  describe: 'Close connection to a given address',

  builder: {},

  handler (argv) {
    if (!utils.isDaemonOn()) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    argv.ipfs.swarm.disconnect(argv.address, (err, res) => {
      if (err) {
        throw err
      }

      console.log(res.Strings[0])
    })
  }
}
