'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:floodsub')
log.error = debug('cli:floodsub:error')

module.exports = {
  command: 'publish <topic> <data>',

  describe: 'Publish data to a topic',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.floodsub.publish(argv.topic, argv.data, (err) => {
        if (err) {
          throw err
        }
      })
    })
  }
}
