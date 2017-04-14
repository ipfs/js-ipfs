'use strict'

const promisify = require('promisify-es6')
const streamToValue = require('../stream-to-value')

module.exports = (send) => {
  return {
    get: promisify((key, opts, callback) => {
      if (typeof opts === 'function' && !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' && typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      function handleResult (done, err, res) {
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
      if (typeof opts === 'function' && !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' && typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'dht/put',
        args: [key, value],
        qs: opts
      }, callback)
    }),

    findprovs: promisify((cid, opts, callback) => {
      if (typeof opts === 'function' && !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' && typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      send.andTransform({
        path: 'dht/findprovs',
        args: cid,
        qs: opts
      }, streamToValue, callback)
    }),

    findpeer: promisify((peerId, opts, callback) => {
      if (typeof opts === 'function' && !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' && typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      send.andTransform({
        path: 'dht/findpeer',
        args: peerId,
        qs: opts
      }, streamToValue, callback)
    }),

    provide: promisify((cids, opts, callback) => {
      if (typeof opts === 'function' && !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' && typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      if (!Array.isArray(cids)) {
        cids = [cids]
      }

      send({
        path: 'dht/provide',
        args: cids,
        qs: opts
      }, callback)
    }),

    // find closest peerId to given peerId
    query: promisify((peerId, opts, callback) => {
      if (typeof opts === 'function' && !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' && typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      send.andTransform({
        path: 'dht/query',
        args: peerId,
        qs: opts
      }, streamToValue, callback)
    })
  }
}
