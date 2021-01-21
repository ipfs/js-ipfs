'use strict'

/* eslint-env browser */
const Client = require('./client')
const { decodeCID, CID } = require('ipfs-message-port-protocol/src/cid')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-message-port-server/src/pin').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-server/src/pin').PinService} PinService
 * @typedef {import('./client').MessageTransport} MessageTransport
 */

/**
 * @class
 * @extends {Client<PinService>}
 */
class PinClient extends Client {
  /**
   * @param {MessageTransport} transport
   */
  constructor (transport) {
    super('pin', ['add'], transport)
  }

  /**
   * @param {string|CID} pathOrCID
   * @param {Object} [options]
   * @property {boolean} [recursive=true]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @returns {Promise<CID>}
   */
  async add (pathOrCID, options = {}) {
    const { recursive, timeout, signal } = options
    const { cid } = await this.remote.add({
      path: encodeLocation(pathOrCID),
      recursive,
      timeout,
      signal
    })
    return decodeCID(cid)
  }
}
module.exports = PinClient

/**
 * Turns content address (path or CID) into path.
 *
 * @param {string|CID} pathOrCID
 * @returns {string}
 */
const encodeLocation = pathOrCID =>
  CID.isCID(pathOrCID) ? `/ipfs/${pathOrCID.toString()}` : `${pathOrCID}`
