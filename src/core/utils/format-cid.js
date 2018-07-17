'use strict'

const CID = require('cids')

module.exports = (cid, base) => {
  if (Buffer.isBuffer(cid)) {
    cid = new CID(cid)
  }

  if (base === 'base58btc') {
    return cid.toBaseEncodedString()
  }

  return cid.toV1().toBaseEncodedString(base)
}
