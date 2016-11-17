'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:floodsub')
log.error = debug('cli:floodsub:error')

module.exports = {
  command: 'pub <topic> <message>',

  describe: 'Publish a message to a topic',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.floodsub.pub(argv.topic, argv.message, (err) => {
        if (err) {
          throw err
        }
      })
    })
  }
}
