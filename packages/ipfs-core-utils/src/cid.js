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
 * @param {CID|Uint8Array|string} input - The CID to encode
 * @param {Object} [options] - Optional options
 * @param {import('cids').BaseNameOrCode} [options.base] - Name of multibase codec to encode the CID with
 * @param {boolean} [options.upgrade] - Automatically upgrade v0 CIDs to v1 when
 * necessary. Default: true.
 * @returns {string} - CID in string representation
 */
exports.cidToString = (input, options = {}) => {
  const upgrade = options.upgrade !== false
  let cid = CID.isCID(input)
    ? input
    // @ts-ignore - TS seems to get confused by the type defs in CID repo.
    : new CID(input)

  if (cid.version === 0 && options.base && options.base !== 'base58btc') {
    if (!upgrade) return cid.toString()
    cid = cid.toV1()
  }

  return cid.toBaseEncodedString(options.base)
}
