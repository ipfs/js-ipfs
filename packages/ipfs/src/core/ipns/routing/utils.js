'use strict'

const multibase = require('multibase')
const ipns = require('ipns')

module.exports = {
  encodeBase32: (buf) => {
    const m = multibase.encode('base32', buf).slice(1) // slice off multibase codec

    return m.toString().toUpperCase() // should be uppercase for interop with go
  },
  validator: {
    func: (key, record, cb) => ipns.validator.validate(record, key, cb)
  },
  selector: (k, records) => ipns.validator.select(records[0], records[1])
}
