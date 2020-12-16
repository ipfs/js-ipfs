'use strict'

const normaliseContent = require('./normalise-content.browser')
const normaliseInput = require('./normalise-input')

/**
 * Transforms any of the `ipfs.add` input types into
 *
 * ```
 * AsyncIterable<{ path, mode, mtime, content: Blob }>
 * ```
 *
 * See https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
 *
 * @param {import('ipfs-core-types/src/files').ImportSource} input
 * @returns {AsyncIterable<import('ipfs-core-types/src/files').Entry<Blob>>}
 */
module.exports = (input) => normaliseInput(input, normaliseContent)
