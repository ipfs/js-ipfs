'use strict'

const multibase = require('multibase')

module.exports.encodeBase32 = (buf) => {
  return multibase.encode('base32', buf).slice(1) // slice off multibase codec
}
