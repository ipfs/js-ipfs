'use strict'

const fs = require('fs')
const bl = require('bl')
const multibase = require('multibase')
const { print } = require('../../../utils')
const { cidToString } = require('../../../../utils/cid')

function parseAndAddNode (key, data, ipfs, options) {
  ipfs.object.patch.setData(key, data, {
    enc: 'base58'
  }, (err, cid) => {
    if (err) {
      throw err
    }

    print(cidToString(cid, { base: options.cidBase, upgrade: false }))
  })
}

module.exports = {
  command: 'set-data <root> [data]',

  describe: 'Set data field of an ipfs object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
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
