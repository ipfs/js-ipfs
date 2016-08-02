'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'new',

  describe: 'Create new ipfs objects',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.object.new((err, node) => {
        if (err) {
          throw err
        }

        console.log(node.toJSON().Hash)
      })
    })
  }
}
