'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'get <key>',

  describe: 'Get and serialize the DAG node named by <key>',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.object.get(argv.key, {enc: 'base58'}, (err, node) => {
        if (err) {
          throw err
        }

        node.toJSON((err, nodeJSON) => {
          if (err) {
            throw err
          }
          nodeJSON.Data = nodeJSON.Data ? nodeJSON.Data.toString() : ''
          console.log(JSON.stringify(nodeJSON))
        })
      })
    })
  }
}
