'use strict'

const ipns = require('ipns')
const uint8ArrayToString = require('uint8arrays/to-string')

module.exports = {
  /**
   * @param {Uint8Array} buf
   */
  encodeBase32: (buf) => uint8ArrayToString(buf, 'base32upper'),
  validator: {
    /**
     * @param {Uint8Array} key
     * @param {Uint8Array} record
     */
    func: (key, record) => ipns.validator.validate(record, key)
  },
  /**
   * @param {*} _k
   * @param {Uint8Array[]} records
   */
  selector: (_k, records) => ipns.validator.select(records[0], records[1])
}
