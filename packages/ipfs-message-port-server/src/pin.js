'use strict'

/* eslint-env browser */

const { decodeCID, encodeCID } = require('ipfs-message-port-protocol/src/cid')
const { decodeIterable, encodeIterable } = require('ipfs-message-port-protocol/src/core')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-message-port-protocol/src/pin').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-protocol/src/pin').Service} Service
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 *
 * @implements {Service}
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
   * @param {import('ipfs-message-port-protocol/src/pin').AddQuery} query
   */
  async add (query) {
    const cid = await this.ipfs.pin.add(decodePathOrCID(query.path), query)
    /** @type {Transferable[]} */
    const transfer = []
    return { cid: encodeCID(cid, transfer), transfer }
  }

  /**
   * @param {import('ipfs-message-port-protocol/src/pin').ListQuery} query
   */
  ls (query) {
    const { paths } = query
    const decodedPaths = paths === undefined
      ? undefined
      : paths.map(decodePathOrCID)

    const result = this.ipfs.pin.ls({ ...query, paths: decodedPaths })

    return encodeListResult(result)
  }

  /**
   * @param {import('ipfs-message-port-protocol/src/pin').RemoveQuery} query
   */
  async rm (query) {
    const result = await this.ipfs.pin.rm(decodePathOrCID(query.source), query)
    /** @type {Transferable[]} */
    const transfer = []
    return { cid: encodeCID(result, transfer), transfer }
  }

  /**
   * @param {import('ipfs-message-port-protocol/src/pin').RemoveAllQuery} query
   */
  rmAll (query) {
    const { signal, source, timeout } = query

    const result = this.ipfs.pin.rmAll(decodeSource(source), {
      signal,
      timeout
    })
    return encodeRmAllResult(result)
  }
}

/**
 * @param {import('ipfs-message-port-protocol/src/pin').EncodedPinSource} source
 */
const decodeSource = (source) => decodeIterable(source, decodePin)

/**
 *
 * @param {string|EncodedCID} pathOrCID
 * @returns {string|CID}
 */
const decodePathOrCID = pathOrCID =>
  typeof pathOrCID === 'string' ? pathOrCID : decodeCID(pathOrCID)

/**
 *
 * @param {import('ipfs-message-port-protocol/src/pin').EncodedPin} pin
 */
const decodePin = pin => pin

/**
 *
 * @param {AsyncIterable<import('ipfs-core-types/src/pin').LsResult>} entries
 * @returns {import('ipfs-message-port-protocol/src/pin').ListResult}
 */
const encodeListResult = entries => {
  /** @type {Transferable[]} */
  const transfer = []
  return { data: encodeIterable(entries, encodePinEntry, transfer), transfer }
}

/**
 *
 * @param {AsyncIterable<CID>} entries
 * @returns {import('ipfs-message-port-protocol/src/pin').RemoveAllResult}
 */
const encodeRmAllResult = entries => {
  /** @type {Transferable[]} */
  const transfer = []
  return { data: encodeIterable(entries, encodeCID, transfer), transfer }
}

/**
 * @param {import('ipfs-core-types/src/pin').LsResult} entry
 * @param {Transferable[]} _transfer
 */
const encodePinEntry = (entry, _transfer) => {
  // Important: Looks like pin.ls sometimes yields cid
  // which is referenced once again later, which is why
  // we MUST note transfer CID or it gets corrupt.
  return {
    ...entry,
    cid: encodeCID(entry.cid)
  }
}
