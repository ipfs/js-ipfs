import { normaliseContent } from './normalise-content.browser.js'
import { normaliseCandidateSingle } from './normalise-candidate-single.js'

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidate} ImportCandidate
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
 * @param {ImportCandidate} input
 * @returns {BrowserImportCandidate}
 */
export function normaliseInput (input) {
  // @ts-expect-error browser normaliseContent returns a Blob not an AsyncIterable<Uint8Array>
  return normaliseCandidateSingle(input, normaliseContent)
}
