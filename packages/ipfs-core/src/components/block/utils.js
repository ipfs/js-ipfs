'use strict'

const CID = require('cids')
const errCode = require('err-code')

/**
 * @param {string|Uint8Array|CID} cid
 * @returns {CID}
 */
exports.cleanCid = cid => {
  if (CID.isCID(cid)) {
    return cid
  }

  // CID constructor knows how to do the cleaning :)
  try {
    // @ts-ignore - string|Uint8Array union seems to confuse CID typedefs.
    return new CID(cid)
  } catch (err) {
    throw errCode(err, 'ERR_INVALID_CID')
  }
}
