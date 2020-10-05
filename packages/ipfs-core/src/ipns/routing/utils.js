'use strict'

const ipns = require('ipns')
const uint8ArrayToString = require('uint8arrays/to-string')

module.exports = {
  encodeBase32: (buf) => uint8ArrayToString(buf, 'base32upper'),
  validator: {
    func: (key, record, cb) => ipns.validator.validate(record, key, cb)
  },
  selector: (_k, records) => ipns.validator.select(records[0], records[1])
}
