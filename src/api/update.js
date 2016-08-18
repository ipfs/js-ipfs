'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    apply: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'update',
        qs: opts
      }, callback)
    }),
    check: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'update/check',
        qs: opts
      }, callback)
    }),
    log: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'update/log',
        qs: opts
      }, callback)
    })
  }
}
