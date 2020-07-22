'use strict'

const errCode = require('err-code')
const browserStreamToIt = require('browser-readablestream-to-it')
const itPeekable = require('it-peekable')
const map = require('it-map')
const {
  isBytes,
  isBlob,
  isFileObject
} = require('./utils')

module.exports = async function * normaliseInput (input, normaliseContent) {
  // must give us something
  if (input === null || input === undefined) {
    throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
  }

  // String
  if (typeof input === 'string' || input instanceof String) {
    yield toFileObject(input, normaliseContent)
    return
  }

  // Buffer|ArrayBuffer|TypedArray
  // Blob|File
  if (isBytes(input) || isBlob(input)) {
    yield toFileObject(input, normaliseContent)
    return
  }

  // Browser ReadableStream
  if (typeof input.getReader === 'function') {
    input = browserStreamToIt(input)
  }

  // Iterable<?>
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
    // (Async)Iterable<Bytes>
    if (Number.isInteger(value) || isBytes(value)) {
      yield toFileObject(peekable, normaliseContent)
      return
    }

    // (Async)Iterable<Blob>
    // (Async)Iterable<String>
    // (Async)Iterable<{ path, content }>
    if (isFileObject(value) || isBlob(value) || typeof value === 'string' || value instanceof String) {
      yield * map(peekable, (value) => toFileObject(value, normaliseContent))
      return
    }

    // (Async)Iterable<(Async)Iterable<?>>
    // (Async)Iterable<ReadableStream<?>>
    // ReadableStream<(Async)Iterable<?>>
    // ReadableStream<ReadableStream<?>>
    if (value[Symbol.iterator] || value[Symbol.asyncIterator] || typeof value.getReader === 'function') {
      yield * map(peekable, (value) => toFileObject(value, normaliseContent))
      return
    }
  }

  // { path, content: ? }
  // Note: Detected _after_ (Async)Iterable<?> because Node.js streams have a
  // `path` property that passes this check.
  if (isFileObject(input)) {
    yield toFileObject(input, normaliseContent)
    return
  }

  throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
}

async function toFileObject (input, normaliseContent) {
  const obj = {
    path: input.path || '',
    mode: input.mode,
    mtime: input.mtime
  }

  if (input.content) {
    obj.content = await normaliseContent(input.content)
  } else if (!input.path) { // Not already a file object with path or content prop
    obj.content = await normaliseContent(input)
  }

  return obj
}
