'use strict'

const waterfall = require('run-waterfall')
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'new',

  describe: 'Create new ipfs objects',

  builder: {},

  handler (argv) {
    waterfall([
      (cb) => utils.getIPFS(cb),
      (ipfs, cb) => ipfs.object.new(cb),
      (node, cb) => node.toJSON(cb)
    ], (err, node) => {
      if (err) {
        throw err
      }

      console.log(node.Hash)
    })
  }
}
