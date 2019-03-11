'use strict'

const isIPFS = require('is-ipfs')

const debug = require('debug')
const log = debug('ipfs:ipns:path')
log.error = debug('ipfs:ipns:path:error')

// resolves the given path by parsing out protocol-specific entries
// (e.g. /ipns/<node-key>) and then going through the /ipfs/ entries and returning the final node
const resolvePath = (ipfsNode, name, callback) => {
  // ipns path
  if (isIPFS.ipnsPath(name)) {
    log(`resolve ipns path ${name}`)

    return ipfsNode._ipns.resolve(name, callback)
  }

  // ipfs path
  ipfsNode.dag.get(name.substring('/ipfs/'.length), (err, value) => {
    if (err) {
      return callback(err)
    }

    return callback(null, value)
  })
}

module.exports = {
  resolvePath
}
