// @ts-check
'use strict'

const toStream = require('it-to-stream')
const { readBlob, Blob } = require('ipfs-core-utils/src/files/blob')

/**
 * Takes async iterable of blob parts and inlines all the blobs. Resulting async
 * iterable no longer contains any blobs. Useful for turning this into node
 * stream.
 * @param {AsyncIterable<BlobPart>} source
 * @returns {AsyncIterable<ArrayBuffer|ArrayBufferView|string>}
 */
const unpackBlobs = async function * UnpackBlob (source) {
  for await (const chunk of source) {
    if (chunk instanceof Blob) {
      yield * readBlob(chunk)
    } else {
      yield chunk
    }
  }
}

/**
 * @typedef {import('stream').Readable} Readable
 */

/**
 * Takes async async iterable of `BlobParts` and returns value that can be
 * used as a fetch request body. In node that would be a `Readable` stream
 * in browser it will be a `Promise<Blob>`.
 * @param {AsyncIterable<BlobPart>} source
 * @returns {Readable|Promise<Blob>}
 */
module.exports = (source) =>
  toStream.readable(unpackBlobs(source))
