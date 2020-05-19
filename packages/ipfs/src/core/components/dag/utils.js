'use strict'

const CID = require('cids')
const errCode = require('err-code')
const { Buffer } = require('buffer')

exports.parseArgs = (cid, path, options) => {
  options = options || {}

  // Allow options in path position
  if (path !== undefined && typeof path !== 'string') {
    options = path
    path = undefined
  }

  if (typeof cid === 'string') {
    if (cid.startsWith('/ipfs/')) {
      cid = cid.substring(6)
    }

    const split = cid.split('/')

    try {
      cid = new CID(split[0])
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    split.shift()

    if (split.length > 0) {
      path = split.join('/')
    } else {
      path = path || '/'
    }
  } else if (Buffer.isBuffer(cid)) {
    try {
      cid = new CID(cid)
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }
  }

  return [
    cid,
    path,
    options
  ]
}
