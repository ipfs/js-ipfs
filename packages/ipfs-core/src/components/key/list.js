import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {Object} config
 * @param {import('libp2p/src/keychain')} config.keychain
 */
export function createList ({ keychain }) {
  /**
   * @type {import('ipfs-core-types/src/key').API<{}>["list"]}
   */
  const list = () => keychain.listKeys()

  return withTimeoutOption(list)
}
