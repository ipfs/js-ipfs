'use strict'

const print = require('../../../utils').print

module.exports = {
  command: 'subs',

  describe: 'Show current name subscriptions.',

  handler (argv) {
    argv.resolve((async () => {
      const result = await argv.ipfs.name.pubsub.subs()
      result.forEach(s => print(s))
    })())
  }
}
