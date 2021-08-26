'use strict'

const { CID } = require('multiformats/cid')
const errCode = require('err-code')

/**
 * @param {string|Uint8Array|CID} cid
 */
exports.cleanCid = cid => {
  if (cid instanceof CID) {
    return cid
  }

  if (typeof cid === 'string') {
    return CID.parse(cid)
  }

  if (cid instanceof Uint8Array) {
    return CID.decode(cid)
  }

  throw errCode(new Error('Invalid CID'), 'ERR_INVALID_CID')
}
