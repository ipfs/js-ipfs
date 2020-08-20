'use strict'

const last = require('it-last')

module.exports = ({ addAll }) => {
  /**
   * Import a file or data into IPFS.
   * 
   * @param {import('./add-all').Source} source - Data to import
   * 
   * @param {object} [options] 
   * @param {String} [options.chunker] - chunking algorithm used to build ipfs DAGs (default: `'size-262144'`)
   * @param {Number} [options.cidVersion] - the CID version to use when storing the data (default: `0`)
   * @param {String} [options.hashAlg] - multihash hashing algorithm to use (default: `'sha2-256'`)
   * @param {boolean} [options.onlyHash] - If true, will not add blocks to the blockstore (default: `false`)
   * @param {boolean} [options.pin] - pin this object when adding (default: `true`)
   * @param {function} [options.progress] - a function that will be called with the byte length of chunks as a file is added to ipfs (default: `undefined`)
   * @param {boolean} [options.rawLeaves] - if true, DAG leaves will contain raw file data and not be wrapped in a protobuf (default: `false`)
   * @param {boolean} [options.trickle] - if true will use the [trickle DAG](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle) format for DAG generation (default: `false`)
   * @param {boolean} [options.wrapWithDirectory] - Adds a wrapping node around the content (default: `false`)
   * @param {Number} [options.timeout] - A timeout in ms (default: `undefined`)
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long running requests started as a result of this call (default: `undefined`)
   * 
   * @returns {Promise<import('./add-all').UnixFSEntry>}
   */
  async function add (source, options) { // eslint-disable-line require-await
    return last(addAll(source, options))
  }
  return add
}
