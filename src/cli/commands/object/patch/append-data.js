'use strict'

const utils = require('../../../utils')
const bl = require('bl')
const fs = require('fs')
const waterfall = require('async/waterfall')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

function appendData (key, data) {
  waterfall([
    (cb) => utils.getIPFS(cb),
    (ipfs, cb) => ipfs.object.patch.appendData(key, data, {enc: 'base58'}, cb),
    (node, cb) => node.toJSON(cb)
  ], (err, node) => {
    if (err) {
      throw err
    }

    console.log(node.Hash)
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
