'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'ls',

  describe: 'Get your list of subscriptions',

  builder: {},

  handler (argv) {
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
