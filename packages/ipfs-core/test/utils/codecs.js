/* eslint-env mocha */
'use strict'

const Multicodecs = require('ipfs-core-utils/src/multicodecs')
const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')
const raw = require('multiformats/codecs/raw')

module.exports = new Multicodecs({
  codecs: [dagPb, dagCbor, raw],
  loadCodec: () => Promise.reject('No extra codecs configured')
})
