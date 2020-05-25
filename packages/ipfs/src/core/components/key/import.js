'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('../init').Keychain} Keychain
 * @typedef {import('../init').KeyInfo} KeyInfo
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @typedef {Object} Config
 * @property {Keychain} keychain
 *
 * @param {Config} config
 * @returns {Import}
 */
module.exports = ({ keychain }) => {
  /**
   * @callback Import
   * @param {string} name
   * @param {string} pem
   * @param {string} password
   * @param {WithTimeoutOptions} [options]
   * @returns {KeyInfo}
   *
   * @type {Import}
   */
  const importKey = (name, pem, password, options) =>
    // @ts-ignore - takes 3 params
    keychain.importKey(name, pem, password, options)

  return withTimeoutOption(importKey)
}
