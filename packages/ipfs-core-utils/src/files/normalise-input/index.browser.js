'use strict'

const normaliseContent = require('./normalise-content.browser')
const normalise = require('./normalise-input')

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 * @typedef {import('ipfs-core-types/src/utils').BrowserImportCandidate} BrowserImportCandidate
 */

/**
 * Transforms any of the `ipfs.add` input types into
 *
 * ```
 * AsyncIterable<{ path, mode, mtime, content: Blob }>
 * ```
 *
 * See https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
 *
 * @param {ImportCandidateStream} input
 * @returns {AsyncGenerator<BrowserImportCandidate, void, undefined>}
 */
function normaliseInput (input) {
  // @ts-ignore normaliseContent returns Blob and not AsyncIterator
  return normalise(input, normaliseContent)
}

module.exports = {
  normaliseInput
}
