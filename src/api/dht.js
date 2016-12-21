'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../stream-to-value')

module.exports = (send) => {
  return {
    findprovs: promisify((args, opts, callback) => {
      if (typeof opts === 'function' &&
          !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' &&
          typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      const request = {
        path: 'dht/findprovs',
        args: args,
        qs: opts
      }

      send.andTransform(request, streamToValue, callback)
    }),
    get: promisify((key, opts, callback) => {
      if (typeof opts === 'function' &&
          !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' &&
          typeof callback === 'function') {
        callback = opts
        opts = {}
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

      send({
        path: 'dht/get',
        args: key,
        qs: opts
      }, handleResult.bind(null, callback))
    }),
    put: promisify((key, value, opts, callback) => {
      if (typeof opts === 'function' &&
          !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' &&
          typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'dht/put',
        args: [key, value],
        qs: opts
      }, callback)
    })
  }
}
