'use strict'

const isIPFS = require('is-ipfs')

// resolves the given path by parsing out protocol-specific entries
// (e.g. /ipns/<node-key>) and then going through the /ipfs/ entries and returning the final node
exports.resolvePath = ({ ipns, dag }, name) => {
  // ipns path
  if (isIPFS.ipnsPath(name)) {
    return ipns.resolve(name)
  }

  // ipfs path
  return dag.get(name.substring('/ipfs/'.length))
}
