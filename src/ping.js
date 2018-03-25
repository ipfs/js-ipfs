'use strict'

const promisify = require('promisify-es6')
const moduleConfig = require('./utils/module-config')
const streamToValue = require('./utils/stream-to-value')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((id, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    // Default number of packtes to 1
    if (!opts.n && !opts.count) {
      opts.n = 1
    }
    const request = {
      path: 'ping',
      args: id,
      qs: opts
    }

    // Transform the response stream to a value:
    // [{ Success: <boolean>, Time: <number>, Text: <string> }]
    const transform = (res, callback) => {
      streamToValue(res, (err, res) => {
        if (err) {
          return callback(err)
        }

        callback(null, res)
      })
    }

    send.andTransform(request, transform, callback)
  })
}
