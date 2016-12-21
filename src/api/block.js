'use strict'

const promisify = require('promisify-es6')
const Block = require('ipfs-block')
const multihash = require('multihashes')
const CID = require('cids')
const streamToValue = require('../stream-to-value')

module.exports = (send) => {
  return {
    get: promisify((args, opts, callback) => {
      // TODO this needs to be adjusted with the new go-ipfs http-api
      if (CID.isCID(args)) {
        args = multihash.toB58String(args.multihash)
      }
      if (Buffer.isBuffer(args)) {
        args = multihash.toB58String(args)
      }
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }

      // Transform the response from Buffer or a Stream to a Block
      const transform = (res, callback) => {
        if (Buffer.isBuffer(res)) {
          callback(null, new Block(res))
        } else {
          streamToValue(res, (err, data) => {
            if (err) {
              return callback(err)
            }
            callback(null, new Block(data))
          })
        }
      }

      const request = {
        path: 'block/get',
        args: args,
        qs: opts
      }

      send.andTransform(request, transform, callback)
    }),
    stat: promisify((args, opts, callback) => {
      // TODO this needs to be adjusted with the new go-ipfs http-api
      if (args && CID.isCID(args)) {
        args = multihash.toB58String(args.multihash)
      }

      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      const request = {
        path: 'block/stat',
        args: args,
        qs: opts
      }

      // Transform the response from { Key, Size } objects to { key, size } objects
      const transform = (stats, callback) => {
        callback(null, {
          key: stats.Key,
          size: stats.Size
        })
      }

      send.andTransform(request, transform, callback)
    }),
    put: promisify((block, cid, callback) => {
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
      const transform = (blockInfo, callback) => callback(null, new Block(block))

      send.andTransform(request, transform, callback)
    })
  }
}
