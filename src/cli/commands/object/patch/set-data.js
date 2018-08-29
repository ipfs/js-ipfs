'use strict'

const fs = require('fs')
const bl = require('bl')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const CID = require('cids')
const multibase = require('multibase')
const { print } = require('../../../utils')
const { cidToString } = require('../../../../utils/cid')

function parseAndAddNode (key, data, ipfs, options) {
  ipfs.object.patch.setData(key, data, {
    enc: 'base58'
  }, (err, node) => {
    if (err) {
      throw err
    }

    print(cidToString(new CID(node.multihash), options.cidBase))
  })
}

module.exports = {
  command: 'set-data <root> [data]',

  describe: 'Set data field of an ipfs object',

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
      return parseAndAddNode(argv.root, fs.readFileSync(argv.data), ipfs, argv)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      parseAndAddNode(argv.root, input, ipfs, argv)
    }))
  }
}
