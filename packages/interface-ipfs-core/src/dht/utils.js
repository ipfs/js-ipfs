'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { CID } = require('multiformats/cid')
const { sha256 } = require('multiformats/hashes/sha2')

exports.fakeCid = async (data) => {
  const bytes = data || uint8ArrayFromString(`TEST${Math.random()}`)
  const mh = await sha256.digest(bytes)
  return CID.createV0(mh)
}
