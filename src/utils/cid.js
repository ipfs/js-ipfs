const CID = require('cids')

// Stringify a CID in the requested base, auto-converting to v1 if necessary
exports.cidToString = (cid, base) => {
  if (!CID.isCID(cid)) {
    cid = new CID(cid)
  }

  if (cid.version === 0 && base && base !== 'base58btc') {
    cid = cid.toV1()
  }

  return cid.toBaseEncodedString(base)
}
