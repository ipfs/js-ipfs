'use strict'

const promisify = require('promisify-es6')
const Block = require('ipfs-block')
const CID = require('cids')

module.exports = (send) => {
  return promisify((block, cid, callback) => {
    // TODO this needs to be adjusted with the new go-ipfs http-api
    if (typeof cid === 'function') {
      callback = cid
      cid = {}
    }

    if (Array.isArray(block)) {
      const err = new Error('block.put() only accepts 1 file')
      return callback(err)
    }

    if (typeof block === 'object' && block.data) {
      block = block.data
    }

    const request = {
      path: 'block/put',
      files: block
    }

    // Transform the response to a Block
    const transform = (info, callback) => {
      callback(null, new Block(block, new CID(info.Key)))
    }

    send.andTransform(request, transform, callback)
  })
}
