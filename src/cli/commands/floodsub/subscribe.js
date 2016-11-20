'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:floodsub')
log.error = debug('cli:floodsub:error')

module.exports = {
  command: 'subscribe <topic>',

  describe: 'Subscribe to a topic',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.floodsub.subscribe(argv.topic, (err, stream) => {
        if (err) {
          throw err
        }

        console.log(stream.toString())
      })
    })
  }
}
