'use strict'

module.exports = {
  command: 'ls',

  describe: 'Get your list of subscriptions',

  builder: {},

  handler (argv) {
    const print = require('../../utils').print

    argv.ipfs.pubsub.ls((err, subscriptions) => {
      if (err) {
        throw err
      }

      subscriptions.forEach((sub) => {
        print(sub)
      })
    })
  }
}
