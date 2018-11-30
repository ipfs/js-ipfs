'use strict'

const multibase = require('multibase')

module.exports.encodeBase32 = (buf) => {
  const m = multibase.encode('base32', buf).slice(1) // slice off multibase codec

  return m.toString().toUpperCase() // should be uppercase for interop with go
}
