'use strict'

const bs58 = require('bs58')
const CID = require('cids')

module.exports = function (cid) {
  if (Buffer.isBuffer(cid)) {
    cid = bs58.encode(cid)
  }
  if (CID.isCID(cid)) {
    cid = cid.toBaseEncodedString()
  }
  if (typeof cid !== 'string') {
    throw new Error('unexpected cid type: ' + typeof cid)
  }
  CID.validateCID(new CID(cid.split('/')[0]))
  return cid
}
