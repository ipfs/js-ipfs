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
    (ipfs, cb) => ipfs.object.put(buf, {enc: enc}, cb)
  ], (err, node) => {
    if (err) {
      throw err
    }

    const nodeJSON = node.toJSON()

    console.log('added', nodeJSON.multihash)
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
      const buf = fs.readFileSync(argv.data)
      putNode(buf, argv.inputenc)
      return
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      putNode(input, argv.inputenc)
    }))
  }
}
