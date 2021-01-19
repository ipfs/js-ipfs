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
   * const key = await ipfs.key.rm('my-key')
   *
   * console.log(key)
   * // { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
   * //   name: 'my-key' }
   * ```
   *
   * @param {string} name - The name of the key to remove
   * @returns {Promise<RemovedKey>} - An object that describes the removed key
   */
  const rm = (name) => keychain.removeKey(name)

  return withTimeoutOption(rm)
}

/**
 * @typedef {Object} RemovedKey
 * @property {string} name - The name of the key
 * @property {string} id -  The hash of the key
 */
