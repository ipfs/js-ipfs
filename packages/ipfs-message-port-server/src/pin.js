'use strict'

/* eslint-env browser */

const { CID, decodeCID, encodeCID } = require('ipfs-message-port-protocol/src/cid')
const { decodeIterable, encodeIterable } = require('ipfs-message-port-protocol/src/core')

/**
 * @typedef {import('ipfs-message-port-protocol/src/cid').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-protocol/src/pin').EncodedLsEntry} EncodedLsEntry
 * @typedef {import('ipfs-message-port-protocol/src/pin').EncodedPin} EncodedPin
 * @typedef {import('ipfs-message-port-protocol/src/pin').EncodedSource} EncodedSource
 * @typedef {import('ipfs-message-port-protocol/src/pin').LsEntry} LsEntry
 * @typedef {import('ipfs-message-port-protocol/src/pin').Pin} Pin
 * @typedef {import('ipfs-message-port-protocol/src/pin').PinType} PinType
 * @typedef {import('ipfs-message-port-protocol/src/pin').PinQueryType} PinQueryType
 * @typedef {import('ipfs-message-port-protocol/src/pin').Source} Source
 * @typedef {import('./ipfs').IPFS} IPFS
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/core').RemoteIterable<T>} RemoteIterable
 */

exports.PinService = class PinService {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @typedef {Object} PinQuery
   * @property {string|EncodedCID} path
   * @property {boolean} [recursive=true]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} PinResult
   * @property {EncodedCID} cid
   * @property {Transferable[]} transfer
   *
   * @param {PinQuery} input
   * @returns {Promise<PinResult>}
   */
  async add (input) {
    const cid = await this.ipfs.pin.add(decodePathOrCID(input.path), input)
    /** @type {Transferable[]} */
    const transfer = []
    return { cid: encodeCID(cid, transfer), transfer }
  }

  /**
   * @typedef {Object} LsQuery
   * @property {Array<string|EncodedCID>|string|EncodedCID} [paths]
   * @property {AbortSignal} [signal]
   * @property {number} [timeout]
   * @property {PinType} [type]
   *
   * @typedef {Object} LsResult
   * @property {RemoteIterable<EncodedLsEntry>} data
   * @property {Transferable[]} transfer
   *
   * @param {LsQuery} query
   * @returns {LsResult}
   */
  ls (query) {
    const { paths, signal, timeout, type } = query
    let decodedPaths

    if (paths === undefined) {
      decodedPaths = undefined
    } else if (Array.isArray(paths)) {
      decodedPaths = []
      paths.forEach(path => decodedPaths.push(
        typeof path === 'string' ? path : decodeCID(path)
      ))
    } else if (typeof paths === 'string') {
      decodedPaths = paths
    } else {
      decodedPaths = decodeCID(paths)
    }

    const result = this.ipfs.pin.ls({ paths: decodedPaths, signal, timeout, type })
    return encodeLsResult(result)
  }

  /**
   * @typedef {Object} RmAllQuery
   * @property {EncodedSource} source
   * @property {AbortSignal} [signal]
   * @property {number} [timeout]
   *
   * @typedef {Object} RmAllResult
   * @property {RemoteIterable<EncodedCID>} data
   * @property {Transferable[]} transfer
   *
   * @param {RmAllQuery} query
   * @returns {RmAllResult}
   */
  rmAll (query) {
    const { signal, source, timeout } = query
    const decodedSource = /** @type {RemoteIterable<EncodedPin>} */(source).port
      ? decodeIterable(/** @type {RemoteIterable<EncodedPin>} */(source), decodePin)
      : decodePin(/** @type {EncodedPin} */(source))

    const result = this.ipfs.pin.rmAll(decodedSource, { signal, timeout })
    return encodeRmAllResult(result)
  }
}

/**
 *
 * @param {string|EncodedCID} pathOrCID
 * @returns {string|CID}
 */
const decodePathOrCID = pathOrCID =>
  typeof pathOrCID === "string" ? pathOrCID : decodeCID(pathOrCID)

/**
 *
 * @param {EncodedPin} pin
 * @returns {Pin}
 */
const decodePin = pin => {
  return { ...pin, path: decodePathOrCID(pin.path) }
}

/**
 *
 * @param {AsyncIterable<LsEntry>} entries
 * @returns {LsResult}
 */
const encodeLsResult = entries => {
  /** @type {Transferable[]} */
  const transfer = []
  return { data: encodeIterable(entries, encodeLsEntry, transfer), transfer }
}

/**
 *
 * @param {AsyncIterable<CID>} entries
 * @returns {RmAllResult}
 */
const encodeRmAllResult = entries => {
  /** @type {Transferable[]} */
  const transfer = []
  return { data: encodeIterable(entries, encodeCID, transfer), transfer }
}

/**
 *
 * @param {LsEntry} entry
 * @returns {EncodedLsEntry}
 */
const encodeLsEntry = ({ cid, metadata, type }, transfer) => {
  const entry = {
    cid: encodeCID(cid, transfer),
    type
  }

  if (metadata) {
    entry.metadata = metadata
  }

  return entry
}
