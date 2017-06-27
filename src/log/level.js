'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((subsystem, level, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    if (typeof subsystem !== 'string') {
      return callback(new Error('Invalid subsystem type'))
    }

    if (typeof level !== 'string') {
      return callback(new Error('Invalid level type'))
    }

    send({
      path: 'log/level',
      args: [subsystem, level],
      qs: opts,
      files: undefined,
      buffer: true
    }, callback)
  })
}
