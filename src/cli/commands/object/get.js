'use strict'

const waterfall = require('async/waterfall')
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'get <key>',

  describe: 'Get and serialize the DAG node named by <key>',

  builder: {},

  handler (argv) {
    waterfall([
      (cb) => utils.getIPFS(cb),
      (ipfs, cb) => ipfs.object.get(argv.key, {enc: 'base58'}, cb)
    ], (err, node) => {
      if (err) {
        throw err
      }
      const nodeJSON = node.toJSON()

      nodeJSON.data = nodeJSON.data ? nodeJSON.data.toString() : ''

      const answer = {
        Data: nodeJSON.data,
        Hash: nodeJSON.multihash,
        Size: nodeJSON.size,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: l.multihash
          }
        })
      }

      console.log(JSON.stringify(answer))
    })
  }
}
