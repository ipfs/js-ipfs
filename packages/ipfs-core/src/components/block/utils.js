'use strict'

const { CID } = require('multiformats/cid')

/**
 * @param {string|Uint8Array|CID} cid
 */
exports.cleanCid = cid => {
  if (cid instanceof Uint8Array) {
    return CID.decode(cid)
  }

  return CID.parse(cid.toString())
}
