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
   * const pem = await ipfs.key.export('self', 'password')
   *
   * console.log(pem)
   * // -----BEGIN ENCRYPTED PRIVATE KEY-----
   * // MIIFDTA/BgkqhkiG9w0BBQ0wMjAaBgkqhkiG9w0BBQwwDQQIpdO40RVyBwACAWQw
   * // ...
   * // YA==
   * // -----END ENCRYPTED PRIVATE KEY-----
   * ```
   * @param {string} name - The name of the key to export
   * @param {string} password - Password to set on the PEM output
   * @returns {Promise<string>} - The string representation of the key
   */
  const exportKey = (name, password) =>
    keychain.exportKey(name, password)

  return withTimeoutOption(exportKey)
}
