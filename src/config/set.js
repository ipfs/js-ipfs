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
  })
}
