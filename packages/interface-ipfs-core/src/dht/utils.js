'use strict'

const { fromString: uint8ArrayFromString } = require('@vascosantos/uint8arrays/from-string')
const { CID } = require('multiformats/cid')
const { sha256 } = require('multiformats/hashes/sha2')

/**
 * @param {Uint8Array} [data]
 * @returns
 */
exports.fakeCid = async (data) => {
  const bytes = data || uint8ArrayFromString(`TEST${Math.random()}`)
  const mh = await sha256.digest(bytes)
  return CID.createV0(mh)
}
