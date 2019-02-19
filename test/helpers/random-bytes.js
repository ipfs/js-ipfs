'use strict'

const crypto = require('crypto')
const MAX_BYTES = 65536

// One day this will be merged: https://github.com/crypto-browserify/randombytes/pull/16
module.exports = function randomBytes (num) {
  const bytes = Buffer.allocUnsafe(num)

  for (let offset = 0; offset < num; offset += MAX_BYTES) {
    let size = MAX_BYTES

    if ((offset + size) > num) {
      size = num - offset
    }

    crypto.randomFillSync(bytes, offset, size)
  }

  return bytes
}
