'use strict'

const utils = require('../../utils')
const CID = require('cids')
const multihashing = require('multihashing-async')
const bl = require('bl')
const fs = require('fs')
const Block = require('ipfs-block')
const waterfall = require('async/waterfall')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

function addBlock (data, opts) {
  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }

    let cid

    waterfall([
      (cb) => multihashing(data, opts.mhtype || 'sha2-256', cb),
      (multihash, cb) => {
        if (!opts.version || opts.version !== 0) {
          cid = new CID(1, opts.format || 'dag-pb', multihash)
        } else {
          cid = new CID(0, 'dag-pb', multihash)
        }
        cb(null, cid)
      },
      (cid, cb) => ipfs.block.put(new Block(data), cid, cb)
    ], (err) => {
      if (err) { throw err }

      // console.log(cid)
      console.log(cid.toBaseEncodedString())
    })
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
    }
  },

  handler (argv) {
    if (argv.block) {
      return addBlock(fs.readFileSync(argv.block), argv)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      addBlock(input, argv)
    }))
  }
}
