'use strict'

const isIPFS = require('is-ipfs')

const debug = require('debug')
const log = debug('jsipfs:ipns:path')
log.error = debug('jsipfs:ipns:path:error')

// resolves the given path by parsing out protocol-specific entries
// (e.g. /ipns/<node-key>) and then going through the /ipfs/ entries and returning the final node
const resolvePath = (ipfsNode, name, callback) => {
  // ipns path
  if (isIPFS.ipnsPath(name)) {
    log(`resolve ipns path ${name}`)

    const local = true // TODO ROUTING - use self._options.local

    const options = {
      local: local
    }

    return ipfsNode._ipns.resolve(name, ipfsNode._peerInfo.id, options, callback)
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
