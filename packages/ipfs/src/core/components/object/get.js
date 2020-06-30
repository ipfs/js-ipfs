'use strict'

const CID = require('cids')
const errCode = require('err-code')
const { Buffer } = require('buffer')
const { withTimeoutOption } = require('../../utils')

function normalizeMultihash (multihash, enc) {
  if (typeof multihash === 'string') {
    if (enc === 'base58' || !enc) {
      return multihash
    }
    return Buffer.from(multihash, enc)
  } else if (Buffer.isBuffer(multihash)) {
    return multihash
  } else if (CID.isCID(multihash)) {
    return multihash.buffer
  }
  throw new Error('unsupported multihash')
}

module.exports = ({ ipld, preload }) => {
  return withTimeoutOption(async function get (multihash, options) { // eslint-disable-line require-await
    options = options || {}

    let mh, cid

    try {
      mh = normalizeMultihash(multihash, options.enc)
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_MULTIHASH')
    }

    try {
      cid = new CID(mh)
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    if (options.cidVersion === 1) {
      cid = cid.toV1()
    }

    if (options.preload !== false) {
      preload(cid)
    }

    return ipld.get(cid, { signal: options.signal })
  })
}
