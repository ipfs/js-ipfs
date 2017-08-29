'use strict'

const bl = require('bl')
const fs = require('fs')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const print = require('../../../utils').print

function appendData (key, data, ipfs) {
  ipfs.object.patch.appendData(key, data, {
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
  command: 'append-data <root> [data]',

  describe: 'Append data to the data segment of a dag node',

  builder: {},

  handler (argv) {
    const ipfs = argv.ipfs
    if (argv.data) {
      return appendData(argv.root, fs.readFileSync(argv.data), ipfs)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      appendData(argv.root, input, ipfs)
    }))
  }
}
