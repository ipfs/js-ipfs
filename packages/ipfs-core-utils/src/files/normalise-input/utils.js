'use strict'

const { Buffer } = require('buffer')
const { Blob, FileReader } = require('ipfs-utils/src/globalthis')

function isBytes (obj) {
  return Buffer.isBuffer(obj) || ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer
}

function isBloby (obj) {
  return typeof Blob !== 'undefined' && obj instanceof Blob
}

// An object with a path or content property
function isFileObject (obj) {
  return typeof obj === 'object' && (obj.path || obj.content)
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

function blobToIt (blob) {
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

module.exports = {
  isBytes,
  isBloby,
  isFileObject,
  browserStreamToIt,
  blobToIt
}
