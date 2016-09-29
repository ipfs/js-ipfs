'use strict'

const utils = require('../../../utils')
const bl = require('bl')
const fs = require('fs')
const waterfall = require('async/waterfall')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

function parseAndAddNode (key, data) {
  waterfall([
    (cb) => utils.getIPFS(cb),
    (ipfs, cb) => ipfs.object.patch.setData(key, data, {enc: 'base58'}, cb),
    (node, cb) => node.toJSON(cb)
  ], (err, node) => {
    if (err) {
      throw err
    }

    console.log(node.Hash)
  })
}

module.exports = {
  command: 'set-data <root> [data]',

  describe: 'Set data field of an ipfs object',

  builder: {},

  handler (argv) {
    if (argv.data) {
      return parseAndAddNode(argv.root, fs.readFileSync(argv.data))
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      parseAndAddNode(argv.root, input)
    }))
  }
}
