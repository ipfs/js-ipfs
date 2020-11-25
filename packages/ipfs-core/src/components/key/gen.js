'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Keychain} config.keychain
 */
module.exports = ({ keychain }) => {
  /**
   * Generate a new key
   *
   * @example
   * ```js
   * const key = await ipfs.key.gen('my-key', {
   *   type: 'rsa',
   *   size: 2048
   * })
   *
   * console.log(key)
   * // { id: 'QmYWqAFvLWb2G5A69JGXui2JJXzaHXiUEmQkQgor6kNNcJ',
   * //  name: 'my-key' }
   * ```
   *
   * @param {string} name - The name to give the key
   * @param {GenOptions & AbortOptions} options
   * @returns {Promise<Key>}
   */
  const gen = (name, options = {}) => {
    return keychain.createKey(name, options.type || 'rsa', options.size || 2048)
  }

  return withTimeoutOption(gen)
}

/**
 * @typedef {Object} GenOptions
 * @property {import('libp2p-crypto').KeyType} [type='RSA'] - The key type
 * @property {number} [size=2048] - The key size in bits
 *
 * @typedef {import('.').Key} Key
 * @typedef {import('.').AbortOptions} AbortOptions
 */
