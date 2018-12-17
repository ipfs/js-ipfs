'use strict'

const bl = require('bl')
const fs = require('fs')
const multibase = require('multibase')
const { print } = require('../../utils')
const { cidToString } = require('../../../utils/cid')

function addBlock (data, opts) {
  const ipfs = opts.ipfs

  ipfs.block.put(data, opts, (err, block) => {
    if (err) {
      throw err
    }
    print(cidToString(block.cid, { base: opts.cidBase }))
  })
}

module.exports = {
  command: 'put [block]',

  describe: 'Stores input as an IPFS block',

  builder: {
    format: {
      alias: 'f',
      describe: 'cid format for blocks to be created with.',
      default: 'dag-pb'
    },
    mhtype: {
      describe: 'multihash hash function',
      default: 'sha2-256'
    },
    mhlen: {
      describe: 'multihash hash length',
      default: undefined
    },
    version: {
      describe: 'cid version',
      type: 'number'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler (argv) {
    if (argv.block) {
      const buf = fs.readFileSync(argv.block)
      return addBlock(buf, argv)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      addBlock(input, argv)
    }))
  }
}
