'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Keychain} config.keychain
 */
module.exports = ({ keychain }) => {
  /**
   * @param {string} name
   * @param {AbortOptions} [options]
   * @returns {Promise<Key>}
   */
  const info = (name, options = {}) => keychain.findKeyByName(name, options)

  return withTimeoutOption(info)
}

/**
 * @typedef {import('.').Key} Key
 * @typedef {import('.').AbortOptions} AbortOptions
 */
