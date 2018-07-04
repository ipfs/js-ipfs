'use strict'

// returns a function with the signature fn(length, callback)
// will pass a buffer of `length` bytes to the callback, unless source ends while
// reading in which case the buffer may be less than `length` bytes long
const bufferPullStreamSource = (source) => {
  let next = Buffer.alloc(0)

  const read = (length, callback) => {
    source(null, (error, buffer) => {
      if (error) {
        if (error === true) {
          // the source stream ended, return what we've got
          return callback(null, next)
        }

        // an actual error occurred
        return callback(error)
      }

      next = Buffer.concat([next, buffer])

      // haven't read enough bytes yet
      if (next.length < length) {
        return read(length, callback)
      }

      // got enough bytes, prepare to send the requested amount
      const slice = next.slice(0, length)

      // store any extra bytes for the next invocation
      next = next.slice(length)

      // return the bytes
      callback(null, slice)
    })
  }

  return read
}

module.exports = bufferPullStreamSource
