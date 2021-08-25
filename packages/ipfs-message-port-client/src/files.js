'use strict'

/* eslint-env browser */
const Client = require('./client')
const { decodeCID } = require('ipfs-message-port-protocol/src/cid')
const { CID } = require('multiformats/cid')

/**
 * @typedef {import('ipfs-message-port-server').FilesService} FilesService
 * @typedef {import('ipfs-message-port-protocol/src/files').EncodedStat} EncodedStat
 * @typedef {import('./client').MessageTransport} MessageTransport
 * @typedef {import('./interface').MessagePortClientOptions} MessagePortClientOptions
 * @typedef {import('ipfs-core-types/src/files').API<MessagePortClientOptions>} FilesAPI
 */

/**
 * @class
 * @extends {Client<FilesService>}
 */
class FilesClient extends Client {
  /**
   * @param {MessageTransport} transport
   */
  constructor (transport) {
    super('files', ['stat'], transport)
  }
}

/**
 * @type {FilesAPI["stat"]}
 */
FilesClient.prototype.stat = async function stat (pathOrCID, options = {}) {
  const { size, hash, withLocal, timeout, signal } = options
  const { stat } = await this.remote.stat({
    path: encodeLocation(pathOrCID),
    size,
    hash,
    withLocal,
    timeout,
    signal
  })
  return decodeStat(stat)
}

module.exports = FilesClient

/**
 * Turns content address (path or CID) into path.
 *
 * @param {string|CID} pathOrCID
 */
const encodeLocation = pathOrCID =>
  pathOrCID instanceof CID ? `/ipfs/${pathOrCID.toString()}` : pathOrCID

/**
 * @param {EncodedStat} data
 */
const decodeStat = data => {
  return { ...data, cid: decodeCID(data.cid) }
}
