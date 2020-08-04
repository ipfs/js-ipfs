'use strict'

/* eslint-env browser */
const { Client } = require('./client')
const { decodeCID, CID } = require('ipfs-message-port-protocol/src/cid')

/**
 * @typedef {import('ipfs-message-port-server/src/files').FilesService} FilesService
 * @typedef {import('ipfs-message-port-server/src/files').EncodedStat} EncodedStat
 * @typedef {import('./client').ClientTransport} Transport
 */

/**
 * @class
 * @extends {Client<FilesService>}
 */
class FilesClient extends Client {
  /**
   * @param {Transport} transport
   */
  constructor (transport) {
    super('files', ['stat'], transport)
  }

  /**
   * @typedef {Object} Stat
   * @property {CID} cid Content identifier.
   * @property {number} size File size in bytes.
   * @property {number} cumulativeSize Size of the DAGNodes making up the file in bytes.
   * @property {"directory"|"file"} type
   * @property {number} blocks Number of files making up directory (when a direcotry)
   * or number of blocks that make up the file (when a file)
   * @property {boolean} withLocality True when locality information is present
   * @property {boolean} local True if the queried dag is fully present locally
   * @property {number} sizeLocal Cumulative size of the data present locally
   *
   * @param {string|CID} pathOrCID
   * @param {Object} [options]
   * @param {boolean} [options.hash=false] If true will only return hash
   * @param {boolean} [options.size=false] If true will only return size
   * @param {boolean} [options.withLocal=false] If true computes size of the dag that is local, and total size when possible
   * @param {number} [options.timeout]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<Stat>}
   */
  async stat (pathOrCID, options = {}) {
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
}
module.exports = FilesClient

/**
 * Turns content address (path or CID) into path.
 * @param {string|CID} pathOrCID
 * @returns {string}
 */
const encodeLocation = pathOrCID =>
  CID.isCID(pathOrCID) ? `/ipfs/${pathOrCID.toString()}` : pathOrCID

/**
 *
 * @param {EncodedStat} data
 * @returns {Stat}
 */
const decodeStat = data => {
  return { ...data, cid: decodeCID(data.cid) }
}
