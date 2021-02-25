'use strict'

/* eslint-env browser */
const Client = require('./client')
const { decodeCID, encodeCID, CID } = require('ipfs-message-port-protocol/src/cid')
const { decodeIterable, encodeIterable } = require('ipfs-message-port-protocol/src/core')

/**
 * @typedef {import('ipfs-message-port-protocol/src/pin').EncodedPin} EncodedPin
 * @typedef {import('ipfs-message-port-protocol/src/pin').LsEntry} LsEntry
 * @typedef {import('ipfs-message-port-protocol/src/pin').LsOptions} LsOptions
 * @typedef {import('ipfs-message-port-protocol/src/pin').Pin} Pin
 * @typedef {import('ipfs-message-port-protocol/src/pin').Source} Source
 * @typedef {import('ipfs-message-port-server/src/pin').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-server/src/pin').EncodedLsEntry} EncodedLsEntry
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
    super('pin', ['add', 'ls', 'rmAll'], transport)
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
      path: encodePathOrCID(pathOrCID),
      recursive,
      timeout,
      signal
    })
    return decodeCID(cid)
  }

  /**
   * @param {LsOptions} [options]
   * @returns {AsyncIterable<LsEntry>}
   */
  async * ls (options = {}) {
    let paths = options.paths
    let encodedPaths

    if (paths === undefined) {
      encodedPaths = paths
    } else if (Array.isArray(paths)) {
      encodedPaths = paths.map(path => encodePathOrCID(path))
    } else {
      encodedPaths = encodePathOrCID(paths)
    }

    const result = await this.remote.ls({ ...options, paths: encodedPaths })

    yield * decodeIterable(result.data, decodeLsEntry)
  }

  /**
   * @typedef {Object} RmAllOptions
   * @property {AbortSignal} [signal]
   * @property {number} [timeout]
   *
   * @param {Source} source
   * @param {RmAllOptions} [options]
   * @returns {AsyncIterable<CID>}
   */
  async * rmAll (source, options = {}) {
    const transfer = []
    const encodedSource = source[Symbol.asyncIterator]
      ? encodeIterable(/** @type {AsyncIterable<Pin>} */(source), encodePin, transfer)
      : encodePin(/** @type {Pin} */(source))

    const result = await this.remote.rmAll({ ...options, source: encodedSource, transfer })

    yield * decodeIterable(result.data, decodeCID)
  }
}
module.exports = PinClient

/**
 *
 * @param {string|CID} pathOrCID
 * @returns {string|EncodedCID}
 */
const encodePathOrCID = pathOrCID =>
  CID.isCID(pathOrCID) ? encodeCID(pathOrCID) : pathOrCID

/**
 *
 * @param {Pin} pin
 * @returns {EncodedPin}
 */
const encodePin = pin => ({
  ...pin, path: typeof pin.path === "string" ? pin.path : encodeCID(pin.path)
})

/**
 * @param {EncodedLsEntry} encodedEntry
 * @returns {LsEntry}
 */
const decodeLsEntry = ({ cid, metadata, type }) => {
  const entry = {
    cid: decodeCID(cid),
    type
  }

  if (metadata) {
    entry.metadata = metadata
  }

  return entry
}
