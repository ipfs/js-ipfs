'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const multihashing = require('multihashing-async')
const CID = require('cids')

exports.fakeCid = async (data) => {
  const bytes = data || uint8ArrayFromString(`TEST${Math.random()}`)
  const mh = await multihashing(bytes, 'sha2-256')
  return new CID(0, 'dag-pb', mh)
}
