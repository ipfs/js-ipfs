'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Get and serialize the DAG node named by <key>',

  options: {},

  run: (key) => {
    if (!key) {
      throw new Error("Argument 'key' is required")
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.object.get(key, {enc: 'base58'}, (err, node) => {
        if (err) {
          throw err
        }

        const res = node.toJSON()
        res.Data = res.Data ? res.Data.toString() : ''
        console.log(JSON.stringify(res))
      })
    })
  }
})
