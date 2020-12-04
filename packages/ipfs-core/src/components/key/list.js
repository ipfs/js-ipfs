'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Keychain} config.keychain
 */
module.exports = ({ keychain }) => {
  /**
   * List all the keys
   *
   * @example
   * ```js
   * const keys = await ipfs.key.list()
   *
   * console.log(keys)
   * // [
   * //   { id: 'QmTe4tuceM2sAmuZiFsJ9tmAopA8au71NabBDdpPYDjxAb',
   * //     name: 'self' },
   * //   { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
   * //     name: 'my-key' }
   * // ]
   * ```
   *
   * @param {AbortOptions} [options]
   * @returns {Promise<KeyEntry[]>}
   */
  const list = (options = {}) => keychain.listKeys(options)

  return withTimeoutOption(list)
}

/**
 * @typedef {Object} KeyEntry
 * @property {string} name - The name of the key
 * @property {string} hash -  The hash of the key
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */
