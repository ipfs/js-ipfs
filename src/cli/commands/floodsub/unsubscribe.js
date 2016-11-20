'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:floodsub')
log.error = debug('cli:floodsub:error')

module.exports = {
  command: 'unsubscribe <topic>',

  describe: 'Unsubscribe from a topic',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.floodsub.unsubscribe(argv.topic, (err) => {
        if (err) {
          throw err
        }
      })
    })
  }
}
