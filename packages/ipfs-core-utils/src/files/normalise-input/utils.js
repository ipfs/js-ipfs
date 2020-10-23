'use strict'

const { Blob } = require('ipfs-utils/src/globalthis')

/**
 * @param {any} obj
 * @returns {obj is ArrayBufferView|ArrayBuffer}
 */
function isBytes (obj) {
  return ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer
}

/**
 * @param {any} obj
 * @returns {obj is Blob}
 */
function isBlob (obj) {
  return typeof Blob !== 'undefined' && obj instanceof Blob
}

/**
 * An object with a path or content property
 *
 * @param {any} obj
 * @returns {obj is import('./normalise-input').FileInput}
 */
function isFileObject (obj) {
  return typeof obj === 'object' && (obj.path || obj.content)
}

/**
 * @param {any} value
 * @returns {value is ReadableStream}
 */
const isReadableStream = (value) =>
  value && typeof value.getReader === 'function'

module.exports = {
  isBytes,
  isBlob,
  isFileObject,
  isReadableStream
}
