'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    add: promisify((hash, opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = null
      }
      send({
        path: 'pin/add',
        args: hash,
        qs: opts
      }, (err, res) => {
        if (err) {
          return callback(err)
        }
        callback(null, res.Pins)
      })
    }),
    rm: promisify((hash, opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = null
      }
      send({
        path: 'pin/rm',
        args: hash,
        qs: opts
      }, (err, res) => {
        if (err) {
          return callback(err)
        }
        callback(null, res.Pins)
      })
    }),
    ls: promisify((hash, opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }

      if (typeof hash === 'object') {
        opts = hash
        hash = undefined
      }

      if (typeof hash === 'function') {
        callback = hash
        hash = undefined
        opts = {}
      }

      send({
        path: 'pin/ls',
        args: hash,
        qs: opts
      }, (err, res) => {
        if (err) {
          return callback(err)
        }
        callback(null, res.Keys)
      })
    })
  }
}
