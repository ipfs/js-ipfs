'use strict'

const waterfall = require('run-waterfall')
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
      (ipfs, cb) => ipfs.object.get(argv.key, {enc: 'base58'}, cb),
      (node, cb) => node.toJSON(cb)
    ], (err, res) => {
      if (err) {
        throw err
      }

      res.Data = res.Data ? res.Data.toString() : ''
      console.log(JSON.stringify(res))
    })
  }
}
