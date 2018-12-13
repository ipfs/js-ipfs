'use strict'

const CID = require('cids')

module.exports = function (cid) {
  if (Buffer.isBuffer(cid)) {
    return new CID(cid).toString()
  }
  if (CID.isCID(cid)) {
    return cid.toString()
  }
  if (typeof cid !== 'string') {
    throw new Error('unexpected cid type: ' + typeof cid)
  }
  new CID(cid.split('/')[0]) // eslint-disable-line no-new
  return cid
}
