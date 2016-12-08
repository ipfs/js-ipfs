'use strict'

const utils = require('../../utils')
const bl = require('bl')
const fs = require('fs')
const Block = require('ipfs-block')
const CID = require('cids')
const waterfall = require('async/waterfall')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

function addBlock (buf, opts) {
  let block = new Block(buf)
  let mhash, cid

  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }

    waterfall([
      (cb) => generateHash(block, opts, cb),
      (cb) => generateCid(mhash, block, opts, cb),
      (cb) => ipfs.block.put(block, cid, cb)
    ], (err) => {
      if (err) {
        throw err
      }

      console.log(cid.toBaseEncodedString())
    })
  })

  function generateHash (block, opts, cb) {
    if (opts.format === 'v0') {
      block.key(done)
    } else {
      block.key(opts.mhtype, done)
    }
    function done (err, _mhash) {
      if (err) return cb(err)
      mhash = _mhash
      cb()
    }
  }

  function generateCid (mhash, block, opts, cb) {
    if (opts.format === 'v0') {
      cid = new CID(0, 'dag-pb', mhash)
    } else {
      cid = new CID(1, opts.format, mhash)
    }
    cb()
  }
}

module.exports = {
  command: 'put [data]',

  describe: 'Stores input as an IPFS block',

  builder: {
    format: {
      alias: 'f',
      describe: 'cid format for blocks to be created with.',
      default: 'v0'
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
    if (argv.data) {
      return addBlock(fs.readFileSync(argv.data), argv)
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      addBlock(input, argv)
    }))
  }
}
