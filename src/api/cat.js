'use strict'

const bs58 = require('bs58')
const isIPFS = require('is-ipfs')
const promisify = require('promisify-es6')

module.exports = (send) => {
  const cat = promisify((multihash, callback) => {
    try {
      multihash = cleanMultihash(multihash)
    } catch (err) {
      return callback(err)
    }
    send('cat', multihash, null, null, callback)
  })
  return cat
}

function cleanMultihash (multihash) {
  if (!isIPFS.multihash(multihash)) {
    throw new Error('not valid multihash')
  }
  if (Buffer.isBuffer(multihash)) {
    return bs58.encode(multihash)
  }
  return multihash
}
