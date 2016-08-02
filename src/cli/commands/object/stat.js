'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'stat <key>',

  describe: 'Get stats for the DAG node named by <key>',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.object.stat(argv.key, {enc: 'base58'}, (err, stats) => {
        if (err) {
          throw err
        }

        delete stats.Hash // only for js-ipfs-api output

        Object.keys(stats).forEach((key) => {
          console.log(`${key}: ${stats[key]}`)
        })
      })
    })
  }
}
