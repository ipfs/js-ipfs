'use strict'

const multibase = require('multibase')
const ipns = require('ipns')

module.exports = {
  /**
   * @param {Buffer} buf
   * @returns {string}
   */
  encodeBase32: (buf) => {
    const m = multibase.encode('base32', buf).slice(1) // slice off multibase codec

    return m.toString().toUpperCase() // should be uppercase for interop with go
  },
  validator: {
    /**
     * @param {*} key
     * @param {*} record
     */
    // Note: - cb seems to be gone in `ipns.validator.validate`
    func: (key, record) => ipns.validator.validate(record, key)
  },
  /**
   * @param {*} k
   * @param {*} records
   * @returns {*}
   */
  selector: (k, records) => ipns.validator.select(records[0], records[1])
}
