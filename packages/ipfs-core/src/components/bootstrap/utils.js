import mafmt from 'mafmt'

/**
 * @param {any} ma
 */
export function isValidMultiaddr (ma) {
  try {
    return mafmt.IPFS.matches(ma)
  } catch (/** @type {any} */ err) {
    return false
  }
}
