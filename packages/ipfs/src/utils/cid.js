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
    // @ts-ignore - TS fails to infer here
    cid = new CID(cid)
  }

  // Type of `cid` is `CID|string|Buffer` to refine it to `CID` we create
  // new variable that has type `CID`.
  let cid2 = /** @type {CID} */(cid)
  if (cid2.version === 0 && options.base && options.base !== 'base58btc') {
    if (!options.upgrade) return cid2.toString()
    cid2 = cid2.toV1()
  }

  return cid2.toBaseEncodedString(options.base)
}
