import { normaliseContent } from './normalise-content.js'
import { normaliseCandidateSingle } from './normalise-candidate-single.js'

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidate} ImportCandidate
 */

/**
 * Transforms any of the `ipfs.add` input types into
 *
 * ```
 * AsyncIterable<{ path, mode, mtime, content: AsyncIterable<Uint8Array> }>
 * ```
 *
 * See https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
 *
 * @param {ImportCandidate} input
 */
export function normaliseInput (input) {
  return normaliseCandidateSingle(input, normaliseContent)
}
