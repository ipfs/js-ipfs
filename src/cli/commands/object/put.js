'use strict'

const bl = require('bl')
const fs = require('fs')
const print = require('../../utils').print

function putNode (buf, enc, ipfs, cb) {
  ipfs.object.put(buf, {enc: enc}, (err, node) => {
    if (err) {
      throw err
    }

    const nodeJSON = node.toJSON()

    print(`added ${nodeJSON.multihash}`)
    if (cb) cb()
  })
}

module.exports = {
  command: 'put [data]',

  describe: 'Stores input as a DAG object, outputs its key',

  builder: {
    'input-enc': {
      type: 'string',
      default: 'json'
    }
  },

  handler (argv) {
    const ipfs = argv.ipfs
    if (argv.data) {
      const buf = fs.readFileSync(argv.data)
      return putNode(buf, argv.inputEnc, ipfs, argv.onComplete)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      putNode(input, argv.inputEnc, ipfs, argv.onComplete)
    }))
  }
}
