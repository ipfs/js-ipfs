'use strict'

const utils = require('../../utils')
const CID = require('cids')
const debug = require('debug')
const log = debug('cli:block')
log.error = debug('cli:block:error')

module.exports = {
  command: 'get <ref>',

  describe: 'Get a dag node from ipfs.',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      const refParts = argv.ref.split('/')
      const cidString = refParts[0]
      const path = refParts.slice(1).join('/')
      const cid = new CID(cidString)

      ipfs.dag.get(cid, path, (err, result) => {
        if (err) {
          throw err
        }
        const obj = result.value
        if (Buffer.isBuffer(obj)) {
          console.log('0x' + obj.toString('hex'))
        } else {
          console.log(obj)
        }
      })
    })
  }
}
