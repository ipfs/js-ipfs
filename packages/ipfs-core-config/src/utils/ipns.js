import * as ipns from 'ipns'

export const validator = {
  /**
   * @param {Uint8Array} key
   * @param {Uint8Array} record
   */
  func: (key, record) => ipns.validator.validate(record, key)
}

/**
 * @param {*} _k
 * @param {Uint8Array[]} records
 */
export function selector (_k, records) {
  return ipns.validator.select(records[0], records[1])
}
