'use strict'

const errCode = require('err-code')
const { Blob } = require('ipfs-utils/src/globalthis')

const {
  isBytes,
  isBloby
} = require('./utils')

function toBlob (input) {
  // Bytes | String
  if (isBytes(input) || typeof input === 'string') {
    return new Blob([input])
  }

  // Blob | File
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

module.exports = toBlob
