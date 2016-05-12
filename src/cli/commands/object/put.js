'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const bl = require('bl')
const fs = require('fs')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

function putNode (buf, enc) {
  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }

    ipfs.object.put(buf, {enc}, (err, node) => {
      if (err) {
        throw err
      }

      console.log('added', node.toJSON().Hash)
    })
  })
}

module.exports = Command.extend({
  desc: 'Stores input as a DAG object, outputs its key',

  options: {
    inputenc: {
      type: 'string',
      default: 'json'
    }
  },

  run: (inputenc, filePath) => {
    if (filePath) {
      return putNode(fs.readFileSync(filePath), inputenc)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      putNode(input, inputenc)
    }))
  }
})
