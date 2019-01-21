'use strict'

const print = require('../../../utils').print

module.exports = {
  command: 'state',

  describe: 'Query the state of IPNS pubsub.',

  handler (argv) {
    argv.resolve((async () => {
      const result = await argv.ipfs.name.pubsub.state()
      print(result.enabled ? 'enabled' : 'disabled')
    })())
  }
}
