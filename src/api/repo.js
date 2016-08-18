'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    gc: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'repo/gc',
        qs: opts
      }, callback)
    }),
    stat: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'repo/stat',
        qs: opts
      }, callback)
    })
  }
}
