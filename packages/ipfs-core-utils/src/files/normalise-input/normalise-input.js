'use strict'

const errCode = require('err-code')
const browserStreamToIt = require('browser-readablestream-to-it')
const {
  isBytes,
  isBloby,
  isFileObject
} = require('./utils')

module.exports = function normaliseInput (input, normaliseContent) {
  // must give us something
  if (input === null || input === undefined) {
    throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
  }

  // String
  if (typeof input === 'string' || input instanceof String) {
    return (async function * () { // eslint-disable-line require-await
      yield toFileObject(input, normaliseContent)
    })()
  }

  // Buffer|ArrayBuffer|TypedArray
  // Blob|File
  if (isBytes(input) || isBloby(input)) {
    return (async function * () { // eslint-disable-line require-await
      yield toFileObject(input, normaliseContent)
    })()
  }

  // Iterable<?>
  if (input[Symbol.iterator]) {
    return (async function * () { // eslint-disable-line require-await
      const iterator = input[Symbol.iterator]()
      const first = iterator.next()
      if (first.done) return iterator

      // Iterable<Number>
      // Iterable<Bytes>
      if (Number.isInteger(first.value) || isBytes(first.value)) {
        yield toFileObject((function * () {
          yield first.value
          yield * iterator
        })(), normaliseContent)
        return
      }

      // Iterable<Bloby>
      // Iterable<String>
      // Iterable<{ path, content }>
      if (isFileObject(first.value) || isBloby(first.value) || typeof first.value === 'string') {
        yield toFileObject(first.value, normaliseContent)
        for (const obj of iterator) {
          yield toFileObject(obj, normaliseContent)
        }
        return
      }

      throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
    })()
  }

  // window.ReadableStream
  if (typeof input.getReader === 'function') {
    return (async function * () {
      for await (const obj of browserStreamToIt(input)) {
        yield toFileObject(obj, normaliseContent)
      }
    })()
  }

  // AsyncIterable<?>
  if (input[Symbol.asyncIterator]) {
    return (async function * () {
      const iterator = input[Symbol.asyncIterator]()
      const first = await iterator.next()
      if (first.done) return iterator

      // AsyncIterable<Bytes>
      if (isBytes(first.value)) {
        yield toFileObject((async function * () { // eslint-disable-line require-await
          yield first.value
          yield * iterator
        })(), normaliseContent)
        return
      }

      // AsyncIterable<Bloby>
      // AsyncIterable<String>
      // AsyncIterable<{ path, content }>
      if (isFileObject(first.value) || isBloby(first.value) || typeof first.value === 'string') {
        yield toFileObject(first.value, normaliseContent)
        for await (const obj of iterator) {
          yield toFileObject(obj, normaliseContent)
        }
        return
      }

      throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
    })()
  }

  // { path, content: ? }
  // Note: Detected _after_ AsyncIterable<?> because Node.js streams have a
  // `path` property that passes this check.
  if (isFileObject(input)) {
    return (async function * () { // eslint-disable-line require-await
      yield toFileObject(input, normaliseContent)
    })()
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
