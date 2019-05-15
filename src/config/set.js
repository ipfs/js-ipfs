'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((key, value, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    if (typeof key !== 'string') {
      return callback(new Error('Invalid key type'))
    }

    if (value === undefined || Buffer.isBuffer(value)) {
      return callback(new Error('Invalid value type'))
    }

    if (typeof value === 'boolean') {
      value = value.toString()
      opts = { bool: true }
    } else if (typeof value !== 'string') {
      value = JSON.stringify(value)
      opts = { json: true }
    }

    send({
      path: 'config',
      args: [key, value],
      qs: opts,
      files: undefined,
      buffer: true
    }, callback)
  })
}
