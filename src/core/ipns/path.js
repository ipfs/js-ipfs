'use strict'

const CID = require('cids')

const debug = require('debug')
const log = debug('jsipfs:ipns:path')
log.error = debug('jsipfs:ipns:path:error')

const ERR_BAD_PATH = 'ERR_BAD_PATH'
const ERR_NO_COMPONENTS = 'ERR_NO_COMPONENTS'

// resolves the given path by parsing out protocol-specific entries
// (e.g. /ipns/<node-key>) and then going through the /ipfs/ entries and returning the final node
const resolvePath = (ipfsNode, name, callback) => {
  // ipns path
  if (name.startsWith('/ipns/')) {
    log(`resolve ipns path ${name}`)

    const local = true // TODO ROUTING - use self._options.local
    const parts = name.split('/')

    if (parts.length < 3 || parts[2] === '') {
      const error = 'path must contain at least one component'

      log.error(error)
      return callback(Object.assign(new Error(error), { code: ERR_NO_COMPONENTS }))
    }

    // TODO ROUTING - public key from network instead
    const localPublicKey = ipfsNode._peerInfo.id.pubKey
    const options = {
      local: local
    }

    return ipfsNode._ipns.resolve(name, localPublicKey, options, callback)
  }

  // ipfs path
  ipfsNode.dag.get(name.substring('/ipfs/'.length), (err, value) => {
    if (err) {
      return callback(err)
    }

    return callback(null, value)
  })
}

// parsePath returns a well-formed ipfs Path.
// The returned path will always be prefixed with /ipfs/ or /ipns/.
// If the received string is not a valid ipfs path, an error will be returned
const parsePath = (pathStr) => {
  const badPathError = `invalid 'ipfs ref' path`
  const parts = pathStr.split('/')

  if (parts.length === 1) {
    return parseCidToPath(pathStr)
  }

  // if the path does not begin with a slash, we expect this to start with a hash and be an ipfs path
  if (parts[0] !== '') {
    if (parseCidToPath(parts[0])) {
      return `/ipfs/${pathStr}`
    }
  }

  if (parts.length < 3) {
    log.error(badPathError)
    throw Object.assign(new Error(badPathError), { code: ERR_BAD_PATH })
  }

  if (parts[1] === 'ipfs') {
    if (!parseCidToPath(parts[2])) {
      log.error(badPathError)
      throw Object.assign(new Error(badPathError), { code: ERR_BAD_PATH })
    }
  } else if (parts[1] !== 'ipns') {
    log.error(badPathError)
    throw Object.assign(new Error(badPathError), { code: ERR_BAD_PATH })
  }
  return pathStr
}

// parseCidToPath takes a CID in string form and returns a valid ipfs Path.
const parseCidToPath = (value) => {
  if (value === '') {
    const error = 'path must contain at least one component'

    log.error(error)
    throw Object.assign(new Error(error), { code: ERR_NO_COMPONENTS })
  }

  const cid = new CID(value)
  CID.validateCID(cid)

  return `/ipfs/${value}`
}

module.exports = {
  resolvePath,
  parsePath
}
