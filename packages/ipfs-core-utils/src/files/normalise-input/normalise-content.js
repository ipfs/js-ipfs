'use strict'

const errCode = require('err-code')
const { Buffer } = require('buffer')
const browserStreamToIt = require('browser-readablestream-to-it')
const blobToIt = require('blob-to-it')
const itPeekable = require('it-peekable')
const all = require('it-all')
const map = require('it-map')
const {
  isBytes,
  isBlob
} = require('./utils')

async function * toAsyncIterable (input) {
  // Bytes | String
  if (isBytes(input) || typeof input === 'string' || input instanceof String) {
    yield toBuffer(input)
    return
  }

  // Blob
  if (isBlob(input)) {
    yield * blobToIt(input)
    return
  }

  // Browser stream
  if (typeof input.getReader === 'function') {
    input = browserStreamToIt(input)
  }

  // (Async)Iterator<?>
  if (input[Symbol.iterator] || input[Symbol.asyncIterator]) {
    const peekable = itPeekable(input)
    const { value, done } = await peekable.peek()

    if (done) {
      // make sure empty iterators result in empty files
      yield * peekable
      return
    }

    peekable.push(value)

    // (Async)Iterable<Number>
    if (Number.isInteger(value)) {
      yield toBuffer(await all(peekable))
      return
    }

    // (Async)Iterable<Bytes|String>
    if (isBytes(value) || typeof value === 'string' || value instanceof String) {
      yield * map(peekable, chunk => toBuffer(chunk))
      return
    }
  }

  throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
}

function toBuffer (chunk) {
  return isBytes(chunk) ? chunk : Buffer.from(chunk)
}

module.exports = toAsyncIterable
