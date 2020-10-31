'use strict'

const { withTimeoutOption } = require('../../utils')

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
  const info = async (name, options = {}) => {
    return await keychain.findKeyByName(name, options)
  }

  return withTimeoutOption(info)
}

/**
 * @typedef {import('./gen').Key} Key
 * @typedef {import('.').AbortOptions} AbortOptions
 */
