import { CID } from 'multiformats/cid'

/**
 * @typedef {object} EncodedCID
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
  // @ts-expect-error we are converting this into an object compatible with the CID class
  const cid = (encodedCID)

  if (!cid.asCID) {
    Object.defineProperty(cid, 'asCID', {
      get: () => cid
    })
  }

  if (!cid['/']) {
    Object.defineProperty(cid, '/', {
      get: () => cid.bytes
    })
  }

  Object.setPrototypeOf(cid.multihash.digest, Uint8Array.prototype)
  Object.setPrototypeOf(cid.multihash.bytes, Uint8Array.prototype)
  Object.setPrototypeOf(cid.bytes, Uint8Array.prototype)
  Object.setPrototypeOf(cid, CID.prototype)

  return cid
}
