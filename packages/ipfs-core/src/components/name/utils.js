'use strict'

const isIPFS = require('is-ipfs')

/**
 * resolves the given path by parsing out protocol-specific entries
 * (e.g. /ipns/<node-key>) and then going through the /ipfs/ entries and returning the final node
 *
 * @param {Object} context
 * @param {IPNS} context.ipns
 * @param {DagReader} context.dagReader
 * @param {string} name
 */
exports.resolvePath = ({ ipns, dagReader }, name) => {
  // ipns path
  if (isIPFS.ipnsPath(name)) {
    return ipns.resolve(name)
  }

  // ipfs path
  return dagReader.get(name.substring('/ipfs/'.length))
}

/**
 * @typedef {import('.').DagReader} DagReader
 * @typedef {import('.').IPNS} IPNS
 */
