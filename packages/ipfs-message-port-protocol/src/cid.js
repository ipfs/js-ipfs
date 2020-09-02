'use strict'

const CID = require('cids')

/**
 * @typedef {Object} EncodedCID
 * @property {string} codec
 * @property {Uint8Array} multihash
 * @property {number} version
 */

/**
 * Encodes CID (well not really encodes it as all own properties are going to be
 * be cloned anyway). If `transfer` array is passed underlying `ArrayBuffer`
 * will be added for the transfer list.
 * @param {CID} cid
 * @param {Transferable[]} [transfer]
 * @returns {EncodedCID}
 */
const encodeCID = (cid, transfer) => {
  if (transfer) {
    transfer.push(cid.multihash.buffer)
  }
  return cid
}
exports.encodeCID = encodeCID

/**
 * Decodes encoded CID (well sort of instead it makes nasty mutations to turn
 * structure cloned CID back into itself).
 * @param {EncodedCID} encodedCID
 * @returns {CID}
 */
const decodeCID = encodedCID => {
  /** @type {CID} */
  const cid = (encodedCID)
  Object.setPrototypeOf(cid.multihash, Uint8Array.prototype)
  Object.setPrototypeOf(cid, CID.prototype)
  // TODO: Figure out a way to avoid `Symbol.for` here as it can get out of
  // sync with cids implementation.
  // See: https://github.com/moxystudio/js-class-is/issues/25
  Object.defineProperty(cid, Symbol.for('@ipld/js-cid/CID'), { value: true })

  return cid
}
exports.decodeCID = decodeCID

exports.CID = CID
