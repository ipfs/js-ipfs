import { CID } from 'multiformats/cid'

/**
 * @typedef {Object} EncodedCID
 * @property {number} code
 * @property {object} multihash
 * @property {Uint8Array} multihash.digest
 * @property {number} version
 */

/**
 * Encodes CID (well not really encodes it as all own properties are going to be
 * be cloned anyway). If `transfer` array is passed underlying `ArrayBuffer`
 * will be added for the transfer list.
 *
 * @param {CID} cid
 * @param {Set<Transferable>} [transfer]
 * @returns {EncodedCID}
 */
export const encodeCID = (cid, transfer) => {
  if (transfer) {
    transfer.add(cid.multihash.bytes.buffer)
  }
  return cid
}

/**
 * Decodes encoded CID (well sort of instead it makes nasty mutations to turn
 * structure cloned CID back into itself).
 *
 * @param {EncodedCID} encodedCID
 * @returns {CID}
 */
export const decodeCID = encodedCID => {
  /** @type {CID} */
  const cid = (encodedCID)

  // @ts-ignore non-enumerable field that doesn't always get transferred
  if (!cid._baseCache) {
    Object.defineProperty(cid, '_baseCache', {
      value: new Map()
    })
  }

  // @ts-ignore non-enumerable field that doesn't always get transferred
  if (!cid.asCID) {
    Object.defineProperty(cid, 'asCID', {
      get: () => cid
    })
  }

  Object.setPrototypeOf(cid.multihash.digest, Uint8Array.prototype)
  Object.setPrototypeOf(cid.multihash.bytes, Uint8Array.prototype)
  Object.setPrototypeOf(cid.bytes, Uint8Array.prototype)
  Object.setPrototypeOf(cid, CID.prototype)
  // TODO: Figure out a way to avoid `Symbol.for` here as it can get out of
  // sync with cids implementation.
  // See: https://github.com/moxystudio/js-class-is/issues/25
  Object.defineProperty(cid, Symbol.for('@ipld/js-cid/CID'), { value: true })

  return cid
}
