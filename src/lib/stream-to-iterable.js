'use strict'

module.exports = function toIterable (body) {
  // Node.js stream
  if (body[Symbol.asyncIterator]) return body

  // Browser ReadableStream
  if (body.getReader) {
    return (async function * () {
      const reader = body.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) return
          yield value
        }
      } finally {
        reader.releaseLock()
      }
    })()
  }

  throw new Error('unknown stream')
}
