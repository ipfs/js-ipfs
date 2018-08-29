'use strict'

const print = require('../../../utils').print

module.exports = {
  command: 'state',

  describe: 'Query the state of IPNS pubsub.',

  handler (argv) {
    argv.ipfs.name.pubsub.state((err, result) => {
      if (err) {
        throw err
      } else {
        print(result.enabled ? 'enabled' : 'disabled')
      }
    })
  }
}
