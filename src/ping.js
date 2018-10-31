'use strict'

const promisify = require('promisify-es6')
const pump = require('pump')
const Writable = require('readable-stream').Writable
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
    // [{ success: <boolean>, time: <number>, text: <string> }]
    const transform = (stream, callback) => {
      const messageConverter = new PingMessageStream()
      const responses = []

      pump(
        stream,
        messageConverter,
        new Writable({
          objectMode: true,
          write (chunk, enc, cb) {
            responses.push(chunk)
            cb()
          }
        }),
        (err) => {
          if (err) {
            return callback(err)
          }
          callback(null, responses)
        }
      )
    }

    send.andTransform(request, transform, callback)
  })
}
