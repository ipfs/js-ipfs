// @ts-check
'use strict'

const { Blob, File } = require('web-file-polyfill')

/**
 * Universal blob reading function
 * @param {InstanceType<typeof window.Blob>} blob
 * @returns {AsyncIterable<Uint8Array>}
 */
// eslint-disable-next-line require-await
const readBlob = async function * BlobParts (blob) {
  // @ts-ignore - https://github.com/microsoft/TypeScript/issues/29867
  yield * blob.stream()
}
exports.readBlob = readBlob
exports.Blob = Blob
exports.File = File
