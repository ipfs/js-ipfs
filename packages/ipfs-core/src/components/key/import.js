import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('@libp2p/interface-keychain').KeyChain} config.keychain
 */
export function createImport ({ keychain }) {
  /**
   * @type {import('ipfs-core-types/src/key').API<{}>["import"]}
   */
  const importKey = (name, pem, password) => {
    return keychain.importKey(name, pem, password)
  }

  return withTimeoutOption(importKey)
}
