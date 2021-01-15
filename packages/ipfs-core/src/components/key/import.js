'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Keychain} config.keychain
 */
module.exports = ({ keychain }) => {
  /**
   * Remove a key
   *
   * @example
   * ```js
   * const key = await ipfs.key.import('clone', pem, 'password')
   *
   * console.log(key)
   * // { id: 'QmQRiays958UM7norGRQUG3tmrLq8pJdmJarwYSk2eLthQ',
   * //   name: 'clone' }
   * ```
   * @param {string} name - The name of the key to import
   * @param {string} pem - The PEM encoded key
   * @param {string} password - The password that protects the PEM key
   * @returns {Promise<import('.').Key>} - An object that describes the new key
   */
  const importKey = (name, pem, password) => {
    return keychain.importKey(name, pem, password)
  }

  return withTimeoutOption(importKey)
}
