'use strict'

const CID = require('cids')
const multihashing = require('multihashing-async')
const bl = require('bl')
const fs = require('fs')
const Block = require('ipfs-block')
const waterfall = require('async/waterfall')
const print = require('../../utils').print

function addBlock (data, opts) {
  const ipfs = opts.ipfs
  let cid

  waterfall([
    (cb) => multihashing(data, opts.mhtype || 'sha2-256', cb),
    (multihash, cb) => {
      if (opts.format !== 'dag-pb' || opts.version !== 0) {
        cid = new CID(1, opts.format || 'dag-pb', multihash)
      } else {
        cid = new CID(0, 'dag-pb', multihash)
      }

      ipfs.block.put(new Block(data, cid), cb)
    }
  ], (err) => {
    if (err) {
      throw err
    }
    print(cid.toBaseEncodedString())
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
      type: 'number',
      default: 0
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
