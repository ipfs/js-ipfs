'use strict'

const Command = require('ronin').Command
const utils = require('../../../utils')
const bl = require('bl')
const fs = require('fs')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

function appendData (key, data) {
  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }

    ipfs.object.patch.appendData(key, data, {enc: 'base58'}, (err, node) => {
      if (err) {
        throw err
      }

      console.log(node.toJSON().Hash)
    })
  })
}

module.exports = Command.extend({
  desc: 'Append data to the data segment of a dag node',

  options: {},

  run: (key, filePath) => {
    if (!key) {
      throw new Error("Argument 'root' is required")
    }

    if (filePath) {
      return appendData(key, fs.readFileSync(filePath))
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      appendData(key, input)
    }))
  }
})
