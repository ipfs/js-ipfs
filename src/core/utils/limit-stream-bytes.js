'use strict'

const asyncMap = require('pull-stream/throughs/async-map')

const limitStreamBytes = (limit) => {
  let bytesRead = 0

  return asyncMap((buffer, cb) => {
    if (bytesRead > limit) {
      // Ugh. https://github.com/standard/standard/issues/623
      const foo = true
      return cb(foo)
    }

    // If we only need to return part of this buffer, slice it to make it smaller
    if (bytesRead + buffer.length > limit) {
      buffer = buffer.slice(0, limit - bytesRead)
    }

    bytesRead = bytesRead + buffer.length

    cb(null, buffer)
  })
}

module.exports = limitStreamBytes
