'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('libp2p/src/keychain')} config.keychain
 */
module.exports = ({ keychain }) => {
  /**
   * @type {import('ipfs-core-types/src/key').API["info"]}
   */
  const info = (name) => keychain.findKeyByName(name)

  return withTimeoutOption(info)
}
