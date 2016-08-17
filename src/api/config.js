'use strict'

const streamifier = require('streamifier')
const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    get: promisify((key, callback) => {
      if (typeof key === 'function') {
        callback = key
        key = undefined
      }

      if (!key) {
        send({
          path: 'config/show',
          buffer: true
        }, callback)
        return
      }

      send({
        path: 'config',
        args: key,
        buffer: true
      }, (err, response) => {
        if (err) {
          return callback(err)
        }
        callback(null, response.Value)
      })
    }),
    set: promisify((key, value, opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }
      if (typeof key !== 'string') {
        return callback(new Error('Invalid key type'))
      }

      if (typeof value !== 'object' &&
          typeof value !== 'boolean' &&
          typeof value !== 'string') {
        return callback(new Error('Invalid value type'))
      }

      if (typeof value === 'object') {
        value = JSON.stringify(value)
        opts = { json: true }
      }

      if (typeof value === 'boolean') {
        value = value.toString()
        opts = { bool: true }
      }

      send({
        path: 'config',
        args: [key, value],
        qs: opts,
        files: undefined,
        buffer: true
      }, callback)
    }),
    replace: promisify((config, callback) => {
      if (typeof config === 'object') {
        config = streamifier.createReadStream(new Buffer(JSON.stringify(config)))
      }

      send({
        path: 'config/replace',
        files: config,
        buffer: true
      }, callback)
    })
  }
}
