'use strict'

const promisify = require('promisify-es6')
const pump = require('pump')
const concat = require('concat-stream')
const moduleConfig = require('./utils/module-config')
const PingMessageStream = require('./utils/ping-message-stream')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((id, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    if (opts.n && opts.count) {
      return callback(new Error('Use either n or count, not both'))
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
    const transform = (stream, callback) => {
      const messageConverter = new PingMessageStream()
      pump(
        stream,
        messageConverter,
        concat({encoding: 'object'}, (data) => callback(null, data)),
        (err) => {
          if (err) callback(err)
        }
      )
    }

    send.andTransform(request, transform, callback)
  })
}
