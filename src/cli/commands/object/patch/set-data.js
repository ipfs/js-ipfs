'use strict'

const Command = require('ronin').Command
const utils = require('../../../utils')
const bs58 = require('bs58')
const bl = require('bl')
const fs = require('fs')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

function parseAndAddNode (keyStr, data) {
  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }

    const key = utils.isDaemonOn() ? keyStr : new Buffer(bs58.decode(keyStr))

    ipfs.object.patch.setData(key, data, (err, obj) => {
      if (err) {
        log.error(err)
        throw err
      }

      if (typeof obj.multihash === 'function') {
        console.log(bs58.encode(obj.multihash()).toString())
        return
      }

      console.log(obj.Hash)
    })
  })
}

module.exports = Command.extend({
  desc: 'Set data field of an ipfs object',

  options: {},

  run: (key, filePath) => {
    if (!key) {
      throw new Error("Argument 'root' is required")
    }

    if (filePath) {
      return parseAndAddNode(key, fs.readFileSync(filePath))
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        log.error(err)
        throw err
      }

      parseAndAddNode(key, input)
    }))
  }
})
