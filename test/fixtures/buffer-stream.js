'use strict'

const endPullStream = require('../../src/core/utils/end-pull-stream')
const crypto = require('crypto')

const defaultOptions = {
  chunkSize: 4096,
  collector: () => {}
}

const bufferStream = (limit, options = {}) => {
  options = Object.assign({}, defaultOptions, options)
  let emitted = 0

  return (error, cb) => {
    if (error) {
      return cb(error)
    }

    const nextLength = emitted + options.chunkSize
    let nextChunkSize = options.chunkSize

    if (nextLength > limit) {
      // emit the final chunk
      nextChunkSize = limit - emitted
    }

    if (nextChunkSize < 1) {
      // we've emitted all requested data, end the stream
      return endPullStream(cb)
    }

    emitted += nextChunkSize

    const bytes = crypto.randomBytes(nextChunkSize)

    options.collector(bytes)

    return cb(null, bytes)
  }
}

module.exports = bufferStream
