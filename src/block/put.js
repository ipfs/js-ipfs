'use strict'

const promisify = require('promisify-es6')
const Block = require('ipfs-block')
const CID = require('cids')
const once = require('once')
const SendOneFile = require('../utils/send-one-file')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'block/put')

  return promisify((block, cid, _callback) => {
    // TODO this needs to be adjusted with the new go-ipfs http-api
    if (typeof cid === 'function') {
      _callback = cid
      cid = {}
    }

    const callback = once(_callback)

    if (Array.isArray(block)) {
      return callback(new Error('block.put accepts only one block'))
    }

    if (typeof block === 'object' && block.data) {
      block = block.data
    }

    sendOneFile(block, {}, (err, result) => {
      if (err) {
        return callback(err) // early
      }

      callback(null, new Block(block, new CID(result.Key)))
    })
  })
}
