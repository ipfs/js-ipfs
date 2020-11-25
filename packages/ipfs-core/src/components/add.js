'use strict'

const last = require('it-last')

module.exports = ({ addAll }) => {
  /**
   * Import a file or data into IPFS.
   *
   * @param {Source} source
   * @param {AddOptions & AbortOptions} [options]
   * @returns {AddResult}
   */
  async function add (source, options) { // eslint-disable-line require-await
    /** @type {UnixFSEntry} - Could be undefined if empty */
    const result = (await last(addAll(source, options)))
    return result
  }
  return add
}

/**
 * @typedef {object} AddOptions
 * @property {string} [chunker] - chunking algorithm used to build ipfs DAGs (default: `'size-262144'`)
 * @property {number} [cidVersion] - the CID version to use when storing the data (default: `0`)
 * @property {string} [hashAlg] - multihash hashing algorithm to use (default: `'sha2-256'`)
 * @property {boolean} [onlyHash] - If true, will not add blocks to the blockstore (default: `false`)
 * @property {boolean} [pin] - pin this object when adding (default: `true`)
 * @property {(bytes:number, path:string) => void} [progress] - a function that will be called with the number of bytes added as a file is added to ipfs and the path of the file being added
 * @property {boolean} [rawLeaves] - if true, DAG leaves will contain raw file data and not be wrapped in a protobuf (default: `false`)
 * @property {boolean} [trickle] - if true will use the [trickle DAG](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle) format for DAG generation (default: `false`)
 * @property {boolean} [wrapWithDirectory] - Adds a wrapping node around the content (default: `false`)
 *
 * @typedef {Promise<UnixFSEntry>} AddResult
 *
 * @typedef {import('ipfs-core-utils/src/files/normalise-input/normalise-input').FileInput} Source
 *
 * @typedef {import('./add-all').UnixFSEntry} UnixFSEntry
 *
 * @typedef {import('../utils').AbortOptions} AbortOptions
 */
