'use strict'

const print = require('../../../utils').print

module.exports = {
  command: 'cancel <name>',

  describe: 'Cancel a name subscription.',

  handler (argv) {
    argv.ipfs.name.pubsub.cancel(argv.name, (err, result) => {
      if (err) {
        throw err
      } else {
        print(result.canceled ? 'canceled' : 'no subscription')
      }
    })
  }
}
