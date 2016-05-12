'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Create new ipfs objects',

  options: {},

  run: () => {
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
})
