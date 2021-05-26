'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('libp2p/src/keychain')} config.keychain
 */
module.exports = ({ keychain }) => {
  /**
   * @type {import('ipfs-core-types/src/key').API["export"]}
   */
  const exportKey = (name, password) =>
    keychain.exportKey(name, password)

  return withTimeoutOption(exportKey)
}
