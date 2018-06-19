'use strict'

const CID = require('cids')

const BAD_PATH_ERROR = new Error('invalid \'ipfs ref\' path')
const NO_COMPONENTS_ERROR = new Error('path must contain at least one component')

// Should verify if the value exists before publishing it
const resolvePath = (ipfsNode, value, callback) => {
  if (value.startsWith('/ipns/')) {
    // TODO resolve local?
    // TODO Resolve from DHT
    return callback(new Error('not implemented yet'))
  }

  ipfsNode.dag.get(value.substring('/ipfs/'.length), (err, value) => {
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
    throw BAD_PATH_ERROR
  }

  if (parts[1] === 'ipfs') {
    if (!parseCidToPath(parts[2])) {
      throw BAD_PATH_ERROR
    }
  } else if (parts[1] !== 'ipns') {
    throw BAD_PATH_ERROR
  }
  return pathStr
}

// parseCidToPath takes a CID in string form and returns a valid ipfs Path.
const parseCidToPath = (value) => {
  if (value === '') {
    throw NO_COMPONENTS_ERROR
  }

  const cid = new CID(value)
  CID.validateCID(cid)

  return `/ipfs/${value}`
}

module.exports = {
  resolvePath,
  parsePath
}
