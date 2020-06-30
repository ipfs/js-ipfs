'use strict'

// browsers can't stream. When the 'Send ReadableStream in request body' row
// is green here: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#Browser_compatibility
// we'll be able to wrap the passed iterator in the it-to-browser-readablestream module
// in the meantime we have to convert the whole thing to a BufferSource of some sort
const toBuffer = require('it-to-buffer')
const { Buffer } = require('buffer')

module.exports = (it) => {
  async function * bufferise (source) {
    for await (const chunk of source) {
      if (Buffer.isBuffer(chunk)) {
        yield chunk
      } else {
        yield Buffer.from(chunk)
      }
    }
  }

  return toBuffer(bufferise(it))
}
