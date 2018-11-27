'use strict'

const bl = require('bl')
const fs = require('fs')
const print = require('../../utils').print

function putNode (buf, enc, ipfs, cidEnc) {
  ipfs.object.put(buf, { enc: enc }, (err, cid) => {
    if (err) {
      throw err
    }

    print(`added ${cid.toBaseEncodedString(cidEnc)}`)
  })
}

module.exports = {
  command: 'put [data]',

  describe: 'Stores input as a DAG object, outputs its key',

  builder: {
    'input-enc': {
      type: 'string',
      default: 'json'
    },
    'cid-base': {
      default: 'base58btc',
      describe: 'CID base to use.'
    }
  },

  handler (argv) {
    const ipfs = argv.ipfs
    if (argv.data) {
      const buf = fs.readFileSync(argv.data)
      return putNode(buf, argv.inputEnc, ipfs)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      putNode(input, argv.inputEnc, ipfs, argv.cidBase)
    }))
  }
}
