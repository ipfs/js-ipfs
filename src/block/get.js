'use strict'

const promisify = require('promisify-es6')
const Block = require('ipfs-block')
const CID = require('cids')
const streamToValue = require('../utils/stream-to-value')

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    // TODO this needs to be adjusted with the new go-ipfs http-api
    let cid
    try {
      if (CID.isCID(args)) {
        cid = args
        args = cid.toBaseEncodedString()
      } else if (Buffer.isBuffer(args)) {
        cid = new CID(args)
        args = cid.toBaseEncodedString()
      } else if (typeof args === 'string') {
        cid = new CID(args)
      } else {
        return callback(new Error('invalid argument'))
      }
    } catch (err) {
      return callback(err)
    }

    // Transform the response from Buffer or a Stream to a Block
    const transform = (res, callback) => {
      if (Buffer.isBuffer(res)) {
        callback(null, new Block(res, cid))
      } else {
        streamToValue(res, (err, data) => {
          if (err) {
            return callback(err)
          }
          callback(null, new Block(data, cid))
        })
      }
    }

    const request = {
      path: 'block/get',
      args: args,
      qs: opts
    }

    send.andTransform(request, transform, callback)
  })
}
