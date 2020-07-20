'use strict'

const errCode = require('err-code')
const { Buffer } = require('buffer')
const { Blob } = require('ipfs-utils/src/globalthis')

/*
 * Transform one of:
 *
 * ```
 * Bytes (Buffer|ArrayBuffer|TypedArray) [single file]
 * Bloby (Blob|File) [single file]
 * String [single file]
 * { path, content: Bytes } [single file]
 * { path, content: Bloby } [single file]
 * { path, content: String } [single file]
 * { path, content: Iterable<Number> } [single file]
 * { path, content: Iterable<Bytes> } [single file]
 * { path, content: AsyncIterable<Bytes> } [single file]
 * Iterable<Number> [single file]
 * Iterable<Bytes> [single file]
 * Iterable<Bloby> [multiple files]
 * Iterable<String> [multiple files]
 * Iterable<{ path, content: Bytes }> [multiple files]
 * Iterable<{ path, content: Bloby }> [multiple files]
 * Iterable<{ path, content: String }> [multiple files]
 * Iterable<{ path, content: Iterable<Number> }> [multiple files]
 * Iterable<{ path, content: Iterable<Bytes> }> [multiple files]
 * Iterable<{ path, content: AsyncIterable<Bytes> }> [multiple files]
 * AsyncIterable<Bytes> [single file]
 * AsyncIterable<Bloby> [multiple files]
 * AsyncIterable<String> [multiple files]
 * AsyncIterable<{ path, content: Bytes }> [multiple files]
 * AsyncIterable<{ path, content: Bloby }> [multiple files]
 * AsyncIterable<{ path, content: String }> [multiple files]
 * AsyncIterable<{ path, content: Iterable<Number> }> [multiple files]
 * AsyncIterable<{ path, content: Iterable<Bytes> }> [multiple files]
 * AsyncIterable<{ path, content: AsyncIterable<Bytes> }> [multiple files]
 * ```
 * Into:
 *
 * ```
 * AsyncIterable<{ path, content: Blob, mode, mtime }>
 * ```
 *
 * @param input Object
 * @return AsyncInterable<{ path, content: Blob, mode, mtime }>
 */
module.exports = function normaliseInput (input) {
  // must give us something
  if (input === null || input === undefined) {
    throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
  }

  // String
  // Buffer|ArrayBuffer|TypedArray
  // Blob|File
  if (typeof input === 'string' || input instanceof String || isBytes(input) || isBloby(input)) {
    return (async function * () { // eslint-disable-line require-await
      yield toFileObject(input)
    })()
  }

  // Iterable<?>
  if (input[Symbol.iterator]) {
    return (async function * () { // eslint-disable-line require-await
      const iterator = input[Symbol.iterator]()
      const first = iterator.next()

      if (first.done) {
        yield * iterator
        return
      }

      // Iterable<Number>
      // Iterable<Bytes>
      if (Number.isInteger(first.value) || isBytes(first.value)) {
        return toFileObject((function * () {
          yield first.value
          yield * iterator
        })())
      }

      // Iterable<Bloby>
      // Iterable<String>
      // Iterable<{ path, content }>
      if (isFileObject(first.value) || isBloby(first.value) || typeof first.value === 'string') {
        yield toFileObject(first.value)

        for (const obj of iterator) {
          yield toFileObject(obj)
        }
        return
      }

      throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
    })()
  }

  // window.ReadableStream
  if (typeof input.getReader === 'function') {
    return (async function * () { // eslint-disable-line require-await
      yield toFileObject(input)
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
        })())
        return
      }

      // AsyncIterable<Bloby>
      // AsyncIterable<String>
      // AsyncIterable<{ path, content }>
      if (isFileObject(first.value) || isBloby(first.value) || typeof first.value === 'string') {
        yield toFileObject(first.value)
        for await (const obj of iterator) {
          yield toFileObject(obj)
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
      yield toFileObject(input)
    })()
  }

  throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
}

async function toFileObject (input) {
  const obj = {
    path: input.path || '',
    mode: input.mode,
    mtime: input.mtime
  }

  if (input.content) {
    obj.content = await toBlob(input.content)
  } else if (!input.path) { // Not already a file object with path or content prop
    obj.content = await toBlob(input)
  }

  return obj
}

function toBlob (input) {
  // Bytes | String
  if (isBytes(input) || typeof input === 'string') {
    return new Blob([input])
  }

  // Bloby
  if (isBloby(input)) {
    return input
  }

  // Browser stream
  if (typeof input.getReader === 'function') {
    return browserStreamToBlob(input)
  }

  // Iterator<?>
  if (input[Symbol.iterator]) {
    return itToBlob(input[Symbol.iterator]())
  }

  // AsyncIterable<Bytes>
  if (input[Symbol.asyncIterator]) {
    return itToBlob(input[Symbol.asyncIterator]())
  }

  throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
}

function isBytes (obj) {
  return Buffer.isBuffer(obj) || ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer
}

function isBloby (obj) {
  return obj instanceof Blob
}

// An object with a path or content property
function isFileObject (obj) {
  return typeof obj === 'object' && (obj.path || obj.content)
}

async function itToBlob (stream) {
  const parts = []

  for await (const chunk of stream) {
    parts.push(chunk)
  }

  return new Blob(parts)
}

async function browserStreamToBlob (stream) {
  const parts = []
  const reader = stream.getReader()

  while (true) {
    const result = await reader.read()

    if (result.done) {
      break
    }

    parts.push(result.value)
  }

  return new Blob(parts)
}
