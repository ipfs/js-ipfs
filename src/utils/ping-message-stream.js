'use strict'

const TransformStream = require('readable-stream').Transform
const pingMessageConverter = require('./ping-message-converter')

class PingMessageStream extends TransformStream {
  constructor (options) {
    const opts = Object.assign(options || {}, { objectMode: true })
    super(opts)
  }

  _transform (obj, enc, callback) {
    try {
      const msg = pingMessageConverter(obj)
      this.push(msg)
    } catch (err) {
      return callback(err)
    }
    callback()
  }
}

module.exports = PingMessageStream
