'use strict'

const LegacyCID = require('cids')
const { CID } = require('multiformats')
const errCode = require('err-code')

/**
 * Makes sure a CID is a legacy one.
 *
 * If it is already a legacy one, it is returned, if it is a new CID, it's
 * converted to a legacy one.
 *
 * @param {CID|LegacyCID} cid - The object to do the transformation on
 */
const asLegacyCid = (cid) => {
  if (LegacyCID.isCID(cid)) {
    return cid
  }

  const newCid = CID.asCID(cid)
  if (newCid) {
    const { version, code, multihash } = newCid
    return new LegacyCID(version, code, multihash.bytes)
  } else {
    throw errCode(new Error('invalid CID'), 'ERR_INVALID_CID')
  }
}

module.exports = asLegacyCid
