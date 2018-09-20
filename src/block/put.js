'use strict'

const promisify = require('promisify-es6')
const Block = require('ipfs-block')
const CID = require('cids')
const multihash = require('multihashes')
const SendOneFile = require('../utils/send-one-file')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'block/put')

  return promisify((block, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = options || {}

    if (Array.isArray(block)) {
      return callback(new Error('block.put accepts only one block'))
    }

    if (Buffer.isBuffer(block)) {
      block = { data: block }
    }

    if (!block || !block.data) {
      return callback(new Error('invalid block arg'))
    }

    const qs = {}

    if (block.cid || options.cid) {
      let cid

      try {
        cid = new CID(block.cid || options.cid)
      } catch (err) {
        return callback(err)
      }

      const { name, length } = multihash.decode(cid.multihash)

      qs.format = cid.codec
      qs.mhtype = name
      qs.mhlen = length
      qs.version = cid.version
    } else {
      if (options.format) qs.format = options.format
      if (options.mhtype) qs.mhtype = options.mhtype
      if (options.mhlen) qs.mhlen = options.mhlen
      if (options.version != null) qs.version = options.version
    }

    sendOneFile(block.data, { qs }, (err, result) => {
      if (err) {
        // Retry with "protobuf" format for go-ipfs
        // TODO: remove when https://github.com/ipfs/go-cid/issues/75 resolved
        if (qs.format === 'dag-pb') {
          qs.format = 'protobuf'
          return sendOneFile(block.data, { qs }, (err, result) => {
            if (err) return callback(err)
            callback(null, new Block(block.data, new CID(result.Key)))
          })
        }

        return callback(err)
      }

      callback(null, new Block(block.data, new CID(result.Key)))
    })
  })
}
