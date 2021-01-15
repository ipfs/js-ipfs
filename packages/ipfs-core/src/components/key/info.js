'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Keychain} config.keychain
 */
module.exports = ({ keychain }) => {
  /**
   * @param {string} name
   * @returns {Promise<Key>}
   */
  const info = (name) => keychain.findKeyByName(name)

  return withTimeoutOption(info)
}

/**
 * @typedef {import('.').Key} Key
 * @typedef {import('.').AbortOptions} AbortOptions
 */
