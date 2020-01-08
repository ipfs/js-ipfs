'use strict'

const fs = require('fs')
const multibase = require('multibase')
const concat = require('it-concat')
const { cidToString } = require('../../../utils/cid')

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

  async handler (argv) {
    let data

    if (argv.block) {
      data = fs.readFileSync(argv.block)
    } else {
      data = await concat(process.stdin)
    }

    const { cid } = await argv.ipfs.api.block.put(data, argv)
    argv.print(cidToString(cid, { base: argv.cidBase }))
  }
}
