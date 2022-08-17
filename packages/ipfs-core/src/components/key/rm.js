import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('@libp2p/interface-keychain').KeyChain} config.keychain
 */
export function createRm ({ keychain }) {
  /**
   * @type {import('ipfs-core-types/src/key').API<{}>["rm"]}
   */
  const rm = (name) => keychain.removeKey(name)

  return withTimeoutOption(rm)
}
