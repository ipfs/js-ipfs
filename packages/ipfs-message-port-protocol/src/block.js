'use strict'

const { encodeCID, decodeCID } = require('./cid')
const Block = require('ipld-block')

/**
 * @typedef {import('./cid').EncodedCID} EncodedCID
 * @typedef {Object} EncodedBlock
 * @property {Uint8Array} data
 * @property {EncodedCID} cid
 */

/**
 * Encodes Block for over the message channel transfer.
 *
 * If `transfer` array is provided all the encountered `ArrayBuffer`s within
 * this block will be added to the transfer so they are moved across without
 * copy.
 * @param {Block} block
 * @param {Transferable[]} [transfer]
 * @returns {EncodedBlock}
 */
const encodeBlock = ({ cid, data }, transfer) => {
  if (transfer) {
    transfer.push(data.buffer)
  }
  return { cid: encodeCID(cid, transfer), data }
}
exports.encodeBlock = encodeBlock

/**
 * @param {EncodedBlock} encodedBlock
 * @returns {Block}
 */
const decodeBlock = ({ cid, data }) => {
  return new Block(data, decodeCID(cid))
}

exports.decodeBlock = decodeBlock

exports.Block = Block
