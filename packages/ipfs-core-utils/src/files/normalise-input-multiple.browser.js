import { normaliseContent } from './normalise-content.browser.js'
import { normaliseCandidateMultiple } from './normalise-candidate-multiple.js'

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 * @typedef {import('ipfs-core-types/src/utils').BrowserImportCandidate} BrowserImportCandidate
 */

/**
 * Transforms any of the `ipfs.addAll` input types into
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
export function normaliseInput (input) {
  // @ts-expect-error browser normaliseContent returns a Blob not an AsyncIterable<Uint8Array>
  return normaliseCandidateMultiple(input, normaliseContent, true)
}
