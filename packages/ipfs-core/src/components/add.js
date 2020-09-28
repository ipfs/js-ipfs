'use strict'

const last = require('it-last')

/**
 * @typedef {import('./add-all').Source} Source
 * @typedef {import('./add-all').UnixFSEntry} UnixFSEntry
 */

/**
 * @typedef {object} AddOptions
 * @property {string} [chunker] - chunking algorithm used to build ipfs DAGs (default: `'size-262144'`)
 * @property {number} [cidVersion] - the CID version to use when storing the data (default: `0`)
 * @property {string} [hashAlg] - multihash hashing algorithm to use (default: `'sha2-256'`)
 * @property {boolean} [onlyHash] - If true, will not add blocks to the blockstore (default: `false`)
 * @property {boolean} [pin] - pin this object when adding (default: `true`)
 * @property {function} [progress] - a function that will be called with the byte length of chunks as a file is added to ipfs (default: `undefined`)
 * @property {boolean} [rawLeaves] - if true, DAG leaves will contain raw file data and not be wrapped in a protobuf (default: `false`)
 * @property {boolean} [trickle] - if true will use the [trickle DAG](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle) format for DAG generation (default: `false`)
 * @property {boolean} [wrapWithDirectory] - Adds a wrapping node around the content (default: `false`)
 */

/**
 * Import a file or data into IPFS.
 * @template {Record<string, any>} ExtraOptions
 * @callback Add
 * @param {Source} source - Data to import
 * @param {AddOptions & import('../utils').AbortOptions & ExtraOptions} [options]
 * @returns {Promise<UnixFSEntry>}
 */

module.exports = ({ addAll }) => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {Add<{}>}
   */
  async function add (source, options) { // eslint-disable-line require-await
    return last(addAll(source, options))
  }
  return add
}
