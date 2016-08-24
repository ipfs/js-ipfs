'use strict'

const promisify = require('promisify-es6')
const bl = require('bl')
const Block = require('ipfs-block')

module.exports = (send) => {
  return {
    get: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'block/get',
        args: args,
        qs: opts
      }, (err, res) => {
        if (err) {
          return callback(err)
        }
        if (Buffer.isBuffer(res)) {
          callback(null, new Block(res))
        } else {
          res.pipe(bl((err, data) => {
            if (err) {
              return callback(err)
            }
            callback(null, new Block(data))
          }))
        }
      })
    }),
    stat: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'block/stat',
        args: args,
        qs: opts
      }, (err, stats) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          key: stats.Key,
          size: stats.Size
        })
      })
    }),
    put: promisify((block, callback) => {
      if (Array.isArray(block)) {
        const err = new Error('block.put() only accepts 1 file')
        return callback(err)
      }

      if (typeof block === 'object' && block.data) {
        block = block.data
      }

      return send({
        path: 'block/put',
        files: block
      }, (err, blockInfo) => {
        if (err) {
          return callback(err)
        }
        callback(null, new Block(block))
      })
    })
  }
}
