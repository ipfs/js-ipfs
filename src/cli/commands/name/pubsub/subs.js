'use strict'

const print = require('../../../utils').print

module.exports = {
  command: 'subs',

  describe: 'Show current name subscriptions.',

  handler (argv) {
    argv.ipfs.name.pubsub.subs((err, result) => {
      if (err) {
        throw err
      } else {
        result.forEach((s) => {
          print(s)
        })
      }
    })
  }
}
