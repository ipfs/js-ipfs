'use strict'

const errCode = require('err-code')
const { Buffer } = require('buffer')
const {
  isBytes,
  isBloby,
  browserStreamToIt,
  blobToIt
} = require('./utils')

function toAsyncIterable (input) {
  // Bytes | String
  if (isBytes(input) || typeof input === 'string') {
    return (async function * () { // eslint-disable-line require-await
      yield toBuffer(input)
    })()
  }

  // Bloby
  if (isBloby(input)) {
    return blobToIt(input)
  }

  // Browser stream
  if (typeof input.getReader === 'function') {
    return browserStreamToIt(input)
  }

  // Iterator<?>
  if (input[Symbol.iterator]) {
    return (async function * () { // eslint-disable-line require-await
      const iterator = input[Symbol.iterator]()
      const first = iterator.next()
      if (first.done) return iterator

      // Iterable<Number>
      if (Number.isInteger(first.value)) {
        yield toBuffer(Array.from((function * () {
          yield first.value
          yield * iterator
        })()))
        return
      }

      // Iterable<Bytes>
      if (isBytes(first.value)) {
        yield toBuffer(first.value)
        for (const chunk of iterator) {
          yield toBuffer(chunk)
        }
        return
      }

      throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
    })()
  }

  // AsyncIterable<Bytes>
  if (input[Symbol.asyncIterator]) {
    return (async function * () {
      for await (const chunk of input) {
        yield toBuffer(chunk)
      }
    })()
  }

  throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
}

function toBuffer (chunk) {
  return isBytes(chunk) ? chunk : Buffer.from(chunk)
}

module.exports = toAsyncIterable
