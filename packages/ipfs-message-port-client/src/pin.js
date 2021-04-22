'use strict'

/* eslint-env browser */
const CID = require('cids')
const Client = require('./client')
const { decodeCID } = require('ipfs-message-port-protocol/src/cid')
const { decodeIterable, encodeIterable } = require('ipfs-message-port-protocol/src/core')

/**
 * @typedef {import('./client').MessageTransport} MessageTransport
 * @typedef {import('ipfs-message-port-protocol/src/pin').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-server').PinService} PinService
 * @typedef {import('ipfs-message-port-protocol/src/pin').API} API
 */

/**
 * @extends {Client<PinService>}
 * @implements {API}
 */
class PinClient extends Client {
  /**
   * @param {MessageTransport} transport
   */
  constructor (transport) {
    super('pin', ['add', 'ls', 'rm', 'rmAll'], transport)
  }

  /**
   * @param {string|CID} pathOrCID
   * @param {import('ipfs-message-port-protocol/src/pin').AddOptions} [options]
   * @returns {Promise<CID>}
   */
  async add (pathOrCID, options = {}) {
    const { cid } = await this.remote.add({
      ...options,
      path: pathOrCID.toString()
    })
    return decodeCID(cid)
  }

  /**
   * @param {import('ipfs-message-port-protocol/src/pin').ListOptions} [options]
   */
  async * ls (options = {}) {
    const paths = options.paths
    // eslint-disable-next-line no-nested-ternary
    const encodedPaths = paths === undefined
      ? undefined
      : Array.isArray(paths)
        ? paths.map(String)
        : [String(paths)]

    const result = await this.remote.ls({
      ...options,
      paths: encodedPaths
    })

    yield * decodeIterable(result.data, decodePinEntry)
  }

  /**
   * @param {string|CID} source
   * @param {import('ipfs-message-port-protocol/src/pin').RemoveOptions} options
   */
  async rm (source, options = {}) {
    const result = await this.remote.rm({
      ...options,
      source: String(source)
    })
    return decodeCID(result.cid)
  }

  /**
   * @param {import('ipfs-message-port-protocol/src/pin').PinSource} source
   * @param {import('ipfs-message-port-protocol/src/pin').RemoveAllOptions} [options]
   */
  async * rmAll (source, options = {}) {
    const transfer = options.transfer || []
    const result = await this.remote.rmAll({
      ...options,
      transfer,
      source: encodeSource(source, transfer)
    })

    yield * decodeIterable(result.data, decodeCID)
  }
}
module.exports = PinClient

/**
 * @param {import('ipfs-message-port-protocol/src/pin').PinSource} source
 * @param {Transferable[]} transfer
 * @returns {import('ipfs-message-port-protocol/src/pin').EncodedPinSource}
 */
const encodeSource = (source, transfer) =>
  encodeIterable(source, encodeToPin, transfer)
  

/**
 * @param {import('ipfs-core-types/src/pin').ToPin} value
 * @returns {import('ipfs-message-port-protocol/src/pin').EncodedPin}
 */
const encodeToPin = (value) => {
  if (CID.isCID(value)) {
    return {
      type: 'Pin',
      path: value.toString()
    }
  } else if (typeof value === 'string') {
    return {
      type: 'Pin',
      path: value
    }
  } else if (value instanceof String) {
    return {
      type: 'Pin',
      path: value.toString()
    }
  } else if (value.cid) {
    return {
      ...value,
      type: 'Pin',
      cid: undefined,
      path: value.cid.toString()
    }
  } else {
    return {
      ...value,
      type: 'Pin',
      cid: undefined,
      path: value.path.toString()
    }
  }
}


/**
 * @param {import('ipfs-message-port-protocol/src/pin').EncodedPinEntry} entry
 */
const decodePinEntry = (entry) => {
  return {
    ...entry,
    cid: decodeCID(entry.cid)
  }
}
