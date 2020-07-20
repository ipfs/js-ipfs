'use strict'

const errCode = require('err-code')
const { Buffer } = require('buffer')
const { Blob, FileReader } = require('ipfs-utils/src/globalthis')

function toAsyncIterable (input) {
  // Bytes | String
  if (isBytes(input) || typeof input === 'string') {
    return (async function * () { // eslint-disable-line require-await
      yield toBuffer(input)
    })()
  }

  // Bloby
  if (isBloby(input)) {
    return blobToAsyncGenerator(input)
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

function blobToAsyncGenerator (blob) {
  if (typeof blob.stream === 'function') {
    // firefox < 69 does not support blob.stream()
    return browserStreamToIt(blob.stream())
  }

  return readBlob(blob)
}

async function * readBlob (blob, options) {
  options = options || {}

  const reader = new FileReader()
  const chunkSize = options.chunkSize || 1024 * 1024
  let offset = options.offset || 0

  const getNextChunk = () => new Promise((resolve, reject) => {
    reader.onloadend = e => {
      const data = e.target.result
      resolve(data.byteLength === 0 ? null : data)
    }
    reader.onerror = reject

    const end = offset + chunkSize
    const slice = blob.slice(offset, end)
    reader.readAsArrayBuffer(slice)
    offset = end
  })

  while (true) {
    const data = await getNextChunk()

    if (data == null) {
      return
    }

    yield Buffer.from(data)
  }
}

function isBytes (obj) {
  return Buffer.isBuffer(obj) || ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer
}

function isBloby (obj) {
  return obj instanceof Blob
}

async function * browserStreamToIt (stream) {
  const reader = stream.getReader()

  while (true) {
    const result = await reader.read()

    if (result.done) {
      return
    }

    yield result.value
  }
}

module.exports = toAsyncIterable
