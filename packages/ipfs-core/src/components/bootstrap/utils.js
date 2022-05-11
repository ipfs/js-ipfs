import { IPFS } from '@multiformats/mafmt'

/**
 * @param {any} ma
 */
export function isValidMultiaddr (ma) {
  try {
    return IPFS.matches(ma)
  } catch (/** @type {any} */ err) {
    return false
  }
}
