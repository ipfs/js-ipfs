
/* eslint-env browser */

import { Client } from './client.js'
import { decodeCID } from 'ipfs-message-port-protocol/cid'
import { CID } from 'multiformats/cid'

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
export class FilesClient extends Client {
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

/**
 * Turns content address (path or CID) into path.
 *
 * @param {string|CID} pathOrCID
 */
const encodeLocation = pathOrCID => {
  const cid = CID.asCID(pathOrCID)

  return cid ? `/ipfs/${pathOrCID.toString()}` : pathOrCID.toString()
}

/**
 * @param {EncodedStat} data
 */
const decodeStat = data => {
  return { ...data, cid: decodeCID(data.cid) }
}
