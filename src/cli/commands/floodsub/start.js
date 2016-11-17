'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:floodsub')
log.error = debug('cli:floodsub:error')

module.exports = {
  command: 'start',

  describe: 'Start FloodSub',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      const fsub = ipfs.floodsub.start()
      if (fsub) {
        console.log(fsub.toString())
      }
    })
  }
}
