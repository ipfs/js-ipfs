'use strict'

const utils = require('../../utils')
const bl = require('bl')
const fs = require('fs')
const waterfall = require('async/waterfall')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

function putNode (buf, enc) {
  waterfall([
    (cb) => utils.getIPFS(cb),
    (ipfs, cb) => ipfs.object.put(buf, {enc}, cb),
    (node, cb) => node.toJSON(cb)
  ], (err, node) => {
    if (err) {
      throw err
    }

    console.log('added', node.Hash)
  })
}

module.exports = {
  command: 'put [data]',

  describe: 'Stores input as a DAG object, outputs its key',

  builder: {
    inputenc: {
      type: 'string',
      default: 'json'
    }
  },

  handler (argv) {
    if (argv.data) {
      return putNode(fs.readFileSync(argv.data), argv.inputenc)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      putNode(input, argv.inputenc)
    }))
  }
}
