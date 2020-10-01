'use strict'

const CID = require('cids')

/**
* Stringify a CID encoded in the requested base, upgrading to v1 if necessary.
*
* Setting upgrade to false will disable automatic CID upgrading from v0 to v1
* which is necessary if the multibase is something other than base58btc. Note
* that it will also not apply the encoding (since v0 CIDs can only be encoded
* as base58btc).
*
* @param {CID|Buffer|String} cid The CID to encode
* @param {Object} [options] Optional options
* @param {String} [options.base] Name of multibase codec to encode the CID with
* @param {Boolean} [options.upgrade] Automatically upgrade v0 CIDs to v1 when
* necessary. Default: true.
* @returns {String}
*/
exports.cidToString = (cid, options) => {
  options = options || {}
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
