import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {Object} config
 * @param {import('libp2p/src/keychain')} config.keychain
 */
export function createInfo ({ keychain }) {
  /**
   * @type {import('ipfs-core-types/src/key').API<{}>["info"]}
   */
  const info = (name) => keychain.findKeyByName(name)

  return withTimeoutOption(info)
}
