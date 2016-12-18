'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:pubsub')
log.error = debug('cli:pubsub:error')

module.exports = {
  command: 'pub <topic> <data>',

  describe: 'Publish data to a topic',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.pubsub.publish(argv.topic, argv.data, (err) => {
        if (err) {
          throw err
        }
      })
    })
  }
}
