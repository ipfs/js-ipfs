/**
 * @typedef {import('./error').EncodedError} EncodedError
 * @typedef {import('./cid').EncodedCID} EncodedCID
 *
 * @typedef {Object} EncodedRmResult
 * @property {EncodedCID} cid
 * @property {EncodedError|undefined} [error]
 */

/**
 * Encodes Uint8Array for transfer over the message channel.
 *
 * If `transfer` array is provided all the encountered `ArrayBuffer`s within
 * this block will be added to the transfer so they are moved across without
 * copy.
 *
 * @param {Uint8Array} data
 * @param {Set<Transferable>} [transfer]
 */
export const encodeBlock = (data, transfer) => {
  if (transfer) {
    transfer.add(data.buffer)
  }
  return data
}
