'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('../init').Keychain} Keychain
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @typedef {Object} Config
 * @property {Keychain} keychain
 *
 * @param {Config} config
 * @returns {Export}
 */
module.exports = ({ keychain }) => {
  /**
   * @callback Export
   * @param {string} name
   * @param {string} password
   * @param {WithTimeoutOptions} [options]
   * @returns {Promise<string>}
   *
   * @type {Export}
   */
  const exportKey = (name, password, options = {}) =>
    // @ts-ignore - Function takes two arguments
    keychain.exportKey(name, password, options)

  return withTimeoutOption(exportKey)
}
