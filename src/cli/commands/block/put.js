'use strict'

const utils = require('../../utils')
const bs58 = require('bs58')
const bl = require('bl')
const fs = require('fs')
const Block = require('ipfs-block')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

function addBlock (buf) {
  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }

    const block = new Block(buf)

    ipfs.block.put(block, (err, block) => {
      if (err) {
        throw err
      }

      console.log(bs58.encode(block.key()).toString())
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
