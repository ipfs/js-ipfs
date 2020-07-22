'use strict'

const { Blob } = require('ipfs-utils/src/globalthis')

function isBytes (obj) {
  return ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer
}

function isBloby (obj) {
  return typeof Blob !== 'undefined' && obj instanceof Blob
}

// An object with a path or content property
function isFileObject (obj) {
  return typeof obj === 'object' && (obj.path || obj.content)
}

module.exports = {
  isBytes,
  isBloby,
  isFileObject
}
