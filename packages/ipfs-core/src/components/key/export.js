import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('@libp2p/interfaces/keychain').KeyChain} config.keychain
 */
export function createExport ({ keychain }) {
  /**
   * @type {import('ipfs-core-types/src/key').API<{}>["export"]}
   */
  const exportKey = (name, password) =>
    keychain.exportKey(name, password)

  return withTimeoutOption(exportKey)
}
