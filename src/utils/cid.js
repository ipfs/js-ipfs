'use strict'

const CID = require('cids')

// Stringify a CID in the requested base, upgrading to v1 if necessary
exports.cidToString = (cid, options) => {
  options = options || {}
  options.base = options.base || null
  options.upgrade = options.upgrade !== false

  if (!CID.isCID(cid)) {
    cid = new CID(cid)
  }

  if (cid.version === 0 && options.base && options.base !== 'base58btc') {
    if (!options.upgrade) return cid.toString()
    cid = cid.toV1()
  }

  return cid.toBaseEncodedString(options.base)
}
