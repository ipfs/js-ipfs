'use strict'

const toPull = require('stream-to-pull-stream')
const lsReadableStream = require('./ls-readable-stream')

module.exports = (send) => {
  return (args, opts) => {
    opts = opts || {}

    return toPull.source(lsReadableStream(send)(args, opts))
  }
}
