'use strict'

const last = require('it-last')

/**
 * @typedef {object} Options
 * @property {String} [chunker] - chunking algorithm used to build ipfs DAGs (default: `'size-262144'`)
 * @property {Number} [cidVersion] - the CID version to use when storing the data (default: `0`)
 * @property {String} [hashAlg] - multihash hashing algorithm to use (default: `'sha2-256'`)
 * @property {boolean} [onlyHash] - If true, will not add blocks to the blockstore (default: `false`)
 * @property {boolean} [pin] - pin this object when adding (default: `true`)
 * @property {function} [progress] - a function that will be called with the byte length of chunks as a file is added to ipfs (default: `undefined`)
 * @property {boolean} [rawLeaves] - if true, DAG leaves will contain raw file data and not be wrapped in a protobuf (default: `false`)
 * @property {boolean} [trickle] - if true will use the [trickle DAG](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle) format for DAG generation (default: `false`)
 * @property {boolean} [wrapWithDirectory] - Adds a wrapping node around the content (default: `false`)
 * @property {Number} [timeout] - A timeout in ms (default: `undefined`)
 * @property {AbortSignal} [signal] - Can be used to cancel any long running requests started as a result of this call (default: `undefined`)
 */

module.exports = ({ addAll }) => {
  return /**@returns {Promise<import('./add-all').UnixFSEntry>}*/ async function add (/**@type {import('./add-all').Source}*/ source, /**@type {Options}*/ options) { // eslint-disable-line require-await
    return last(addAll(source, options))
  }
}
