'use strict'

const promisify = require('promisify-es6')

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
      }, callback)
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
      }, callback)
    }),
    put: promisify((file, callback) => {
      if (Array.isArray(file)) {
        const err = new Error('block.put() only accepts 1 file')
        return callback(err)
      }

      return send({
        path: 'block/put',
        files: file
      }, callback)
    })
  }
}
