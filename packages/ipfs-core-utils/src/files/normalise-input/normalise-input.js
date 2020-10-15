'use strict'

const errCode = require('err-code')
const browserStreamToIt = require('browser-readablestream-to-it')
const itPeekable = require('it-peekable')
const map = require('it-map')
const {
  isBytes,
  isBlob,
  isReadableStream,
  isFileObject
} = require('./utils')

// eslint-disable-next-line complexity

/**
 * @param {Source} input
 * @param {NormaliseToBlob|NormaliseToStream} normaliseContent
 * @returns {AsyncIterable<Entry>}
 */
// eslint-disable-next-line complexity
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

  // Uint8Array|ArrayBuffer|TypedArray
  // Blob|File
  if (isBytes(input) || isBlob(input)) {
    yield toFileObject(input, normaliseContent)
    return
  }

  // Browser ReadableStream
  if (isReadableStream(input)) {
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
    if (value[Symbol.iterator] || value[Symbol.asyncIterator] || isReadableStream(value)) {
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

/**
 * @param {ToFile} input
 * @param {NormaliseToBlob|NormaliseToStream} normaliseContent
 * @returns {Promise<Entry>}
 */
async function toFileObject (input, normaliseContent) {
  // @ts-ignore - Those properties don't exist on most input types
  const { path, mode, mtime, content } = input

  const file = { path: path || '', mode, mtime }
  if (content) {
    file.content = await normaliseContent(content)
  } else if (!path) { // Not already a file object with path or content prop
    // @ts-ignore - input still can be different ToContent
    file.content = await normaliseContent(input)
  }

  return file
}

/**
 * @typedef {import('../format-mtime').MTime} MTime
 * @typedef {import('../format-mode').Mode} Mode
 *
 * @typedef {Object} File
 * @property {string} path
 * @property {Mode} [mode]
 * @property {MTime} [mtime]
 * @property {AsyncIterable<Uint8Array>|Blob} [content]
 *
 * @typedef {Object} Directory
 * @property {string} path
 * @property {Mode} [mode]
 * @property {MTime} [mtime]
 * @property {undefined} [content]
 *
 * @typedef {File|Directory} Entry
 *
 * @typedef {Object} FileInput
 * @property {string} [path]
 * @property {ToContent} [content]
 * @property {number | string} [mode]
 * @property {UnixTime} [mtime]
 *
 * @typedef {Date | MTime | HRTime} UnixTime
 *
 * Time representation as tuple of two integers, as per the output of
 * [`process.hrtime()`](https://nodejs.org/dist/latest/docs/api/process.html#process_process_hrtime_time).
 * @typedef {[number, number]} HRTime
 *
 * @typedef {string|InstanceType<typeof window.String>|ArrayBufferView|ArrayBuffer|Blob|Iterable<Uint8Array> | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>} ToContent
 * @typedef {ToContent|FileInput} ToFile
 * @typedef {Iterable<ToFile> | AsyncIterable<ToFile> | ReadableStream<ToFile>} Source
 *
 * @typedef {(content:ToContent) => Promise<Blob> | Blob} NormaliseToBlob
 * @typedef {(content:ToContent) => AsyncIterable<Uint8Array>} NormaliseToStream
 */
