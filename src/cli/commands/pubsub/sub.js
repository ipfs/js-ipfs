'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:pubsub')
log.error = debug('cli:pubsub:error')

module.exports = {
  command: 'sub <topic>',

  describe: 'Subscribe to a topic',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      const handler = (msg) => {
        console.log(msg.data.toString())
      }

      ipfs.pubsub.subscribe(argv.topic, handler, (err) => {
        if (err) {
          throw err
        }
      })
    })
  }
}
