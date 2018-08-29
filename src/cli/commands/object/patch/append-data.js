'use strict'

const bl = require('bl')
const fs = require('fs')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const CID = require('cids')
const multibase = require('multibase')
const { print } = require('../../../utils')
const { cidToString } = require('../../../../utils/cid')

function appendData (key, data, ipfs, options) {
  ipfs.object.patch.appendData(key, data, {
    enc: 'base58'
  }, (err, node) => {
    if (err) {
      throw err
    }

    print(cidToString(new CID(node.multihash), options.cidBase))
  })
}

module.exports = {
  command: 'append-data <root> [data]',

  describe: 'Append data to the data segment of a dag node',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler (argv) {
    const ipfs = argv.ipfs
    if (argv.data) {
      return appendData(argv.root, fs.readFileSync(argv.data), ipfs, argv)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      appendData(argv.root, input, ipfs, argv)
    }))
  }
}
