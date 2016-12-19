'use strict'

const utils = require('../../utils')
const bl = require('bl')
const fs = require('fs')
const Block = require('ipfs-block')
const CID = require('cids')
const multihashing = require('multihashing-async')
const waterfall = require('async/waterfall')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

function addBlock (buf, opts) {
  let block = new Block(buf)
  let cid

  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }

    waterfall([
      (cb) => generateHash(block, opts, cb),
      (mhash, cb) => generateCid(mhash, block, opts, cb),
      (cb) => ipfs.block.put(block, cid, cb)
    ], (err) => {
      if (err) {
        throw err
      }

      console.log(cid.toBaseEncodedString())
    })
  })

  function generateHash (block, opts, cb) {
    if (opts.mhlen === undefined) {
      multihashing(buf, opts.mhtype, cb)
    } else {
      multihashing(buf, opts.mhtype, opts.mhlen, cb)
    }
  }

  function generateCid (mhash, block, opts, cb) {
    cid = new CID(opts.verison, opts.format, mhash)
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
    // parse options
    if (argv.format === 'v0') {
      argv.verison = 0
      argv.format = 'dag-pb'
      argv.mhtype = 'sha2-256'
    } else {
      argv.verison = 1
    }

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
