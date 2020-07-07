// @ts-check
'use strict'
/* eslint-env browser */

// browsers can't stream. When the 'Send ReadableStream in request body' row
// is green here: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#Browser_compatibility
// we'll be able to wrap the passed iterator in the it-to-browser-readablestream module
// in the meantime we create Blob out of all parts.

/**
 * Turns async iterable of the `BlobPart`s into an aggregate `Blob`.
 * @param {AsyncIterable<BlobPart>} source
 * @returns {Promise<Blob>}
 */
module.exports = async (source) => {
  const parts = []
  for await (const chunk of source) {
    parts.push(chunk)
  }

  return new Blob(parts)
}
