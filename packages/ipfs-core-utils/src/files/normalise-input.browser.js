import { normaliseContent } from './normalise-content.browser.js'
import { normalise } from './normalise.js'

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
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
 * @param {ImportCandidate | ImportCandidateStream} input
 * @returns {AsyncGenerator<BrowserImportCandidate, void, undefined>}
 */
export function normaliseInput (input) {
  // @ts-ignore normaliseContent returns Blob and not AsyncIterator
  return normalise(input, normaliseContent)
}
