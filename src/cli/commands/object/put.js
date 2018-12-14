'use strict'

const bl = require('bl')
const fs = require('fs')
const multibase = require('multibase')
const { print } = require('../../utils')
const { cidToString } = require('../../../utils/cid')

function putNode (buf, options, ipfs) {
  ipfs.object.put(buf, { enc: options.inputEnc }, (err, cid) => {
    if (err) {
      throw err
    }

    print(`added ${cidToString(cid, { base: options.cidBase, upgrade: false })}`)
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
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler (argv) {
    const ipfs = argv.ipfs
    if (argv.data) {
      const buf = fs.readFileSync(argv.data)
      return putNode(buf, argv, ipfs)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      putNode(input, argv, ipfs)
    }))
  }
}
