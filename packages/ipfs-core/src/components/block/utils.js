'use strict'

const CID = require('cids')
const errCode = require('err-code')

exports.cleanCid = cid => {
  if (CID.isCID(cid)) {
    return cid
  }

  // CID constructor knows how to do the cleaning :)
  try {
    return new CID(cid)
  } catch (err) {
    throw errCode(err, 'ERR_INVALID_CID')
  }
}
