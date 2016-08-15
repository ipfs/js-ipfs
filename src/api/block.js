'use strict'

module.exports = (send) => {
  return {
    get (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'block/get',
        args: args,
        qs: opts
      }, callback)
    },
    stat (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'block/stat',
        args: args,
        qs: opts
      }, callback)
    },
    put (file, callback) {
      if (Array.isArray(file)) {
        const err = new Error('block.put() only accepts 1 file')
        if (typeof callback !== 'function' &&
            typeof Promise !== 'undefined') {
          return new Promise((resolve, reject) => reject(err))
        }
        return callback(err)
      }

      return send({
        path: 'block/put',
        files: file
      }, callback)
    }
  }
}
