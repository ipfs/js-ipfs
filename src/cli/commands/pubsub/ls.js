'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:pubsub')
log.error = debug('cli:pubsub:error')

module.exports = {
  command: 'ls',

  describe: 'Get your list of subscriptions',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.pubsub.ls((err, subscriptions) => {
        if (err) {
          throw err
        }

        console.log(JSON.stringify(subscriptions, null, 2))
      })
    })
  }
}
