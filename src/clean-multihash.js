'use strict'

const bs58 = require('bs58')
const isIPFS = require('is-ipfs')

module.exports = function (multihash) {
  if (!isIPFS.multihash(multihash)) {
    throw new Error('not valid multihash')
  }
  if (Buffer.isBuffer(multihash)) {
    return bs58.encode(multihash)
  }
  return multihash
}

