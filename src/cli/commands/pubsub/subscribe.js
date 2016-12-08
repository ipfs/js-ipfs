'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:pubsub')
log.error = debug('cli:pubsub:error')

module.exports = {
  command: 'subscribe <topic>',

  alias : 'sub',

  describe: 'Subscribe to a topic',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.pubsub.subscribe(argv.topic, (err, stream) => {
        if (err) {
          throw err
        }

        console.log(stream.toString())
      })
    })
  }
}
