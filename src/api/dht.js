'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = send => {
  return {
    findprovs: argCommand(send, 'dht/findprovs'),
    get (key, opts, cb) {
      if (typeof (opts) === 'function' && !cb) {
        cb = opts
        opts = null
      }

      return send('dht/get', key, opts, null, (err, res) => {
        if (err) return cb(err)
        if (!res) return cb(new Error('empty response'))
        if (res.length === 0) return cb(new Error('no value returned for key'))

        // Inconsistent return values in the browser vs node
        if (Array.isArray(res)) {
          res = res[0]
        }

        if (res.Type === 5) {
          cb(null, res.Extra)
        } else {
          cb(res)
        }
      })
    },
    put (key, value, opts, cb) {
      if (typeof (opts) === 'function' && !cb) {
        cb = opts
        opts = null
      }

      return send('dht/put', [key, value], opts, null, cb)
    }
  }
}
