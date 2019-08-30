'use strict'
const base32 = require('base32.js')
const Key = require('interface-datastore').Key
const KEY_PREFIX = 'key_'

module.exports = {
  /**
   * Encode baseNamespace of a Key to base32
   *
   * @param {Key} key
   * @returns {Key}
   *
   * @example convert(new Key('/info/self.data'))
   * // => Key('/info/key_onswyzq.data')
   */
  convert (key) {
    const encoder = new base32.Encoder({ type: 'rfc4648' })
    const baseNameBuff = Buffer.from(key.baseNamespace())
    const encodedBaseNamespace = KEY_PREFIX + encoder.finalize(baseNameBuff).toLowerCase()
    const namespaces = key.namespaces()
    namespaces[namespaces.length - 1] = encodedBaseNamespace // Replace the baseNamespace with encoded one
    return Key.withNamespaces(namespaces)
  },

  /**
   * Decode baseNamespace of a Key from base32
   *
   * @param {Key} key
   * @returns {Key}
   *
   * @example invert(new Key('/info/key_onswyzq.data'))
   * // => Key('/info/self.data')
   */
  invert (key) {
    const baseNamespace = key.baseNamespace()
    if (!baseNamespace.startsWith(KEY_PREFIX)) {
      throw Error('Unknown format of key\'s name!')
    }

    const decoder = new base32.Decoder({ type: 'rfc4648' })
    const decodedBaseNamespace = decoder.finalize(baseNamespace.replace(KEY_PREFIX, '').toUpperCase())
    const namespaces = key.namespaces()
    namespaces[namespaces.length - 1] = Buffer.from(decodedBaseNamespace).toString() // Replace the baseNamespace with encoded one

    return Key.withNamespaces(namespaces)
  }
}
