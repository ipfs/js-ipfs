'use strict'

module.exports = (send) => {
  return {
    findprovs (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'dht/findprovs',
        args: args,
        qs: opts
      }, callback)
    },
    get (key, opts, callback) {
      if (typeof (opts) === 'function' &&
          !callback) {
        callback = opts
        opts = null
      }

      const handleResult = (done, err, res) => {
        if (err) {
          return done(err)
        }
        if (!res) {
          return done(new Error('empty response'))
        }
        if (res.length === 0) {
          return done(new Error('no value returned for key'))
        }

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

      if (typeof callback !== 'function' && typeof Promise !== 'undefined') {
        const done = (err, res) => {
          if (err) throw err
          return res
        }

        return send({
          path: 'dht/get',
          args: key,
          qs: opts
        }).then((res) => handleResult(done, null, res),
                (err) => handleResult(done, err))
      }

      return send({
        path: 'dht/get',
        args: key,
        qs: opts
      }, handleResult.bind(null, callback))
    },
    put (key, value, opts, callback) {
      if (typeof (opts) === 'function' && !callback) {
        callback = opts
        opts = null
      }
      return send({
        path: 'dht/put',
        args: [key, value],
        qs: opts
      }, callback)
    }
  }
}
