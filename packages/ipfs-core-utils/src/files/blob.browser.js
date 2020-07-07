// @ts-check
'use strict'
/* eslint-env browser */

exports.Blob = Blob

/**
 * Universal blob reading function
 * @param {Blob} blob
 * @returns {AsyncIterable<Uint8Array>}
 */
const readBlob = async function * (blob) {
  const { body } = new Response(blob)
  const reader = body.getReader()
  while (true) {
    const next = await reader.read()
    if (next.done) {
      return
    } else {
      yield next.value
    }
  }
}
exports.readBlob = readBlob
