'use strict'

const fs = require('fs')
const bl = require('bl')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const print = require('../../../utils').print

function parseAndAddNode (key, data, ipfs) {
  ipfs.object.patch.setData(key, data, {
    enc: 'base58'
  }, (err, node) => {
    if (err) {
      throw err
    }
    const nodeJSON = node.toJSON()

    print(nodeJSON.multihash)
  })
}

module.exports = {
  command: 'set-data <root> [data]',

  describe: 'Set data field of an ipfs object',

  builder: {},

  handler (argv) {
    const ipfs = argv.ipfs
    if (argv.data) {
      return parseAndAddNode(argv.root, fs.readFileSync(argv.data), ipfs)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      parseAndAddNode(argv.root, input, ipfs)
    }))
  }
}
