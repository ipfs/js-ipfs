'use strict'

const multihashing = require('multihashing-async')
const CID = require('cids')

exports.fakeCid = async (data) => {
  const bytes = data || Buffer.from(`TEST${Date.now()}`)
  const mh = await multihashing(bytes, 'sha2-256')
  return new CID(0, 'dag-pb', mh)
}
