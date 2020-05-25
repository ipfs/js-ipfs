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
 * @returns {Gen}
 */
module.exports = ({ keychain }) => {
  /**
   * @typedef {Object} GenOptions
   * @property {string} [type]
   * @property {number} [size]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @callback Gen
   * @param {string} name
   * @param {GenOptions} [options]
   * @returns {Promise<KeyInfo>|KeyInfo}
   *
   * @type {Gen}
   */
  const gen = (name, options) => {
    options = options || {}
    return keychain.createKey(name, options.type, options.size)
  }

  return withTimeoutOption(gen)
}
