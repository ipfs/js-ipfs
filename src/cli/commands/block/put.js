'use strict'

const utils = require('../../utils')
const mh = require('multihashes')
const bl = require('bl')
const fs = require('fs')
const Block = require('ipfs-block')
const waterfall = require('async/waterfall')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

function addBlock (buf) {
  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }

    waterfall([
      (cb) => Block.create(buf, cb),
      (block, cb) => ipfs.block.put(block, cb)
    ], (err, block) => {
      if (err) {
        throw err
      }

      console.log(mh.toB58String(block.key()))
    })
  })
}

module.exports = {
  command: 'put [data]',

  describe: 'Stores input as an IPFS block',

  builder: {},

  handler (argv) {
    if (argv.data) {
      return addBlock(fs.readFileSync(argv.data))
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        throw err
      }

      addBlock(input)
    }))
  }
}
