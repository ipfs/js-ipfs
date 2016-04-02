const Command = require('ronin').Command
const utils = require('../../utils')
const bs58 = require('bs58')
const bl = require('bl')
const fs = require('fs')
const Block = require('ipfs-blocks').Block
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

function addBlock (buf) {
  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }

    if (utils.isDaemonOn()) {
      return ipfs.block.put(buf, (err, block) => {
        if (err) {
          log.error(err)
          throw err
        }

        console.log(block.Key)
      })
    }

    const block = new Block(buf)

    ipfs.block.put(block, (err, obj) => {
      if (err) {
        log.error(err)
        throw err
      }

      console.log(bs58.encode(block.key).toString())
    })
  })
}

module.exports = Command.extend({
  desc: 'Stores input as an IPFS block',

  options: {},

  run: (filePath) => {
    if (filePath) {
      return addBlock(fs.readFileSync(filePath))
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        log.error(err)
        throw err
      }

      addBlock(input)
    }))
  }
})
