import { createId } from './id.js'

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

/**
 * @param {import('./types').Options} options
 */
export const createIsOnline = options => {
  const id = createId(options)

  /**
   * @type {RootAPI["isOnline"]}
   */
  async function isOnline (options = {}) {
    const res = await id(options)

    return Boolean(res && res.addresses && res.addresses.length)
  }
  return isOnline
}
