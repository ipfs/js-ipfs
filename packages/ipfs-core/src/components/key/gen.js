import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

const DEFAULT_KEY_TYPE = 'Ed25519'
const DEFAULT_KEY_SIZE = 2048

/**
 * @param {object} config
 * @param {import('@libp2p/interfaces/keychain').KeyChain} config.keychain
 */
export function createGen ({ keychain }) {
  /**
   * @type {import('ipfs-core-types/src/key').API<{}>["gen"]}
   */
  const gen = (name, options = { type: DEFAULT_KEY_TYPE, size: DEFAULT_KEY_SIZE }) => {
    return keychain.createKey(name, options.type || DEFAULT_KEY_TYPE, options.size || DEFAULT_KEY_SIZE)
  }

  return withTimeoutOption(gen)
}
