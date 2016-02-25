'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = (send) => {
  return {
    findprovs: argCommand(send, 'dht/findprovs'),
    get (key, opts, cb) {
      if (typeof (opts) === 'function' && !cb) {
        cb = opts
        opts = null
      }

      const handleResult = (done, err, res) => {
        if (err) return done(err)
        if (!res) return done(new Error('empty response'))
        if (res.length === 0) return done(new Error('no value returned for key'))

        // Inconsistent return values in the browser vs node
        if (Array.isArray(res)) {
          res = res[0]
        }

        if (res.Type === 5) {
          done(null, res.Extra)
        } else {
          let error = new Error('key was not found (type 6)')
          done(error)
        }
      }

      if (typeof cb !== 'function' && typeof Promise !== 'undefined') {
        const done = (err, res) => {
          if (err) throw err
          return res
        }

        return send('dht/get', key, opts)
          .then(
            (res) => handleResult(done, null, res),
            (err) => handleResult(done, err)
          )
      }

      return send('dht/get', key, opts, null, handleResult.bind(null, cb))
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
