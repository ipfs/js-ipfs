'use strict'

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

module.exports = {
  command: 'append-data <root> [data]',

  describe: 'Append data to the data segment of a dag node',

  builder: {},

  handler (argv) {
    if (argv.data) {
      return appendData(argv.root, fs.readFileSync(argv.data))
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      appendData(argv.root, input)
    }))
  }
}
