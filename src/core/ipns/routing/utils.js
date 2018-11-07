'use strict'

const base32 = require('base32.js')

module.exports.encodeBase32 = (buf) => {
  const enc = new base32.Encoder()
  return enc.write(buf).finalize()
}
