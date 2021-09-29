import { normaliseContent } from './normalise-content.js'
import { normaliseCandidateMultiple } from './normalise-candidate-multiple.js'

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 */

/**
 * Transforms any of the `ipfs.addAll` input types into
 *
 * ```
 * AsyncIterable<{ path, mode, mtime, content: AsyncIterable<Uint8Array> }>
 * ```
 *
 * See https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
 *
 * @param {ImportCandidateStream} input
 */
export function normaliseInput (input) {
  return normaliseCandidateMultiple(input, normaliseContent)
}
