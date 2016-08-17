'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    net: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'diag/net',
        qs: opts
      }, callback)
    }),
    sys: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'diag/sys',
        qs: opts
      }, callback)
    }),
    cmds: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'diag/cmds',
        qs: opts
      }, callback)
    })
  }
}
