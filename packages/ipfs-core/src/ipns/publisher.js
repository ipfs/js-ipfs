import { isPeerId } from '@libp2p/interfaces/peer-id'
import { notFoundError } from 'datastore-core/errors'
import errcode from 'err-code'
import { logger } from '@libp2p/logger'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import * as ipns from 'ipns'

const log = logger('ipfs:ipns:publisher')

/**
 * @typedef {import('@libp2p/interfaces/keys').PrivateKey} PrivateKey
 * @typedef {import('@libp2p/interfaces/keys').PublicKey} PublicKey
 * @typedef {import('ipns').IPNSEntry} IPNSEntry
 * @typedef {import('@libp2p/interfaces/peer-id').PeerId} PeerId
 */

const ERR_NOT_FOUND = notFoundError().code
const defaultRecordLifetime = 60 * 60 * 1000

// IpnsPublisher is capable of publishing and resolving names to the IPFS routing system.
export class IpnsPublisher {
  /**
   * @param {import('ipfs-core-types/src/utils').BufferStore} routing
   * @param {import('interface-datastore').Datastore} datastore
   */
  constructor (routing, datastore) {
    this._routing = routing
    this._datastore = datastore
  }

  /**
   * Publish record with a eol
   *
   * @param {PeerId} peerId
   * @param {Uint8Array} value
   * @param {number} lifetime
   */
  async publishWithEOL (peerId, value, lifetime) {
    const record = await this._updateOrCreateRecord(peerId, value, lifetime)

    return this._putRecordToRouting(record, peerId)
  }

  /**
   * Accepts a keypair, as well as a value (ipfsPath), and publishes it out to the routing system
   *
   * @param {PeerId} peerId
   * @param {Uint8Array} value
   */
  publish (peerId, value) {
    return this.publishWithEOL(peerId, value, defaultRecordLifetime)
  }

  /**
   * @param {Uint8Array} record
   * @param {PeerId} peerId
   */
  async _putRecordToRouting (record, peerId) {
    if (!(isPeerId(peerId))) {
      const errMsg = 'peerId received is not valid'
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID')
    }

    if (peerId.publicKey == null) {
      throw errcode(new Error('Public key was missing'), 'ERR_MISSING_PUBLIC_KEY')
    }

    const routingKey = ipns.peerIdToRoutingKey(peerId)

    await this._publishEntry(routingKey, record)

    return record
  }

  /**
   * @param {Uint8Array} key
   * @param {Uint8Array} entry
   */
  async _publishEntry (key, entry) {
    // Add record to routing (buffer key)
    try {
      const res = await this._routing.put(key, entry)
      log(`ipns record for ${uint8ArrayToString(key, 'base32')} was stored in the routing`)

      return res
    } catch (/** @type {any} */err) {
      const errMsg = `ipns record for ${uint8ArrayToString(key, 'base32')} could not be stored in the routing - ${err.stack}`
      log.error(errMsg)
      log.error(err)

      throw errcode(new Error(errMsg), 'ERR_PUTTING_TO_ROUTING')
    }
  }

  /**
   * Returns the record this node has published corresponding to the given peer ID.
   *
   * If `checkRouting` is true and we have no existing record, this method will check the routing system for any existing records.
   *
   * @param {PeerId} peerId
   * @param {object} options
   * @param {boolean} [options.checkRouting]
   */
  async _getPublished (peerId, options = {}) {
    if (!(isPeerId(peerId))) {
      const errMsg = 'peerId received is not valid'

      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID')
    }

    const checkRouting = options.checkRouting !== false

    try {
      const dsVal = await this._datastore.get(ipns.getLocalKey(peerId.toBytes()))

      // unmarshal data
      return this._unmarshalData(dsVal)
    } catch (/** @type {any} */ err) {
      if (err.code !== ERR_NOT_FOUND) {
        const errMsg = `unexpected error getting the ipns record ${peerId.toString()} from datastore`
        log.error(errMsg)

        throw errcode(new Error(errMsg), 'ERR_UNEXPECTED_DATASTORE_RESPONSE')
      }

      if (!checkRouting) {
        throw errcode(err, 'ERR_NOT_FOUND_AND_CHECK_ROUTING_NOT_ENABLED')
      }

      // Try to get from routing
      try {
        const routingKey = ipns.peerIdToRoutingKey(peerId)
        const res = await this._routing.get(routingKey)

        // unmarshal data
        return this._unmarshalData(res)
      } catch (/** @type {any} */ err) {
        log.error(err)

        throw err
      }
    }
  }

  /**
   * @param {Uint8Array} data
   */
  _unmarshalData (data) {
    try {
      return ipns.unmarshal(data)
    } catch (/** @type {any} */ err) {
      throw errcode(err, 'ERR_INVALID_RECORD_DATA')
    }
  }

  /**
   * @param {PeerId} peerId
   * @param {Uint8Array} value
   * @param {number} lifetime
   */
  async _updateOrCreateRecord (peerId, value, lifetime) {
    if (!(isPeerId(peerId))) {
      const errMsg = 'peerId received is not valid'
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID')
    }

    const getPublishedOptions = {
      checkRouting: true
    }

    /** @type {IPNSEntry | undefined} */
    let record

    try {
      record = await this._getPublished(peerId, getPublishedOptions)
    } catch (/** @type {any} */ err) {
      if (err.code !== ERR_NOT_FOUND) {
        const errMsg = `unexpected error when determining the last published IPNS record for ${peerId.toString()} ${err.stack}`
        log.error(errMsg)

        throw errcode(new Error(errMsg), 'ERR_DETERMINING_PUBLISHED_RECORD')
      }
    }

    // Determinate the record sequence number
    let seqNumber = 0n

    if (record && record.sequence !== undefined) {
      // Increment if the published value is different
      seqNumber = uint8ArrayEquals(record.value, value) ? record.sequence : record.sequence + BigInt(1)
    }

    /** @type {IPNSEntry} */
    let entryData

    try {
      // Create record
      entryData = await ipns.create(peerId, value, seqNumber, lifetime)
    } catch (/** @type {any} */ err) {
      const errMsg = `ipns record for ${value} could not be created`

      log.error(err)
      throw errcode(new Error(errMsg), 'ERR_CREATING_IPNS_RECORD')
    }

    // TODO IMPROVEMENT - set ttl (still experimental feature for go)

    try {
      // Marshal record
      const data = ipns.marshal(entryData)

      // Store the new record
      await this._datastore.put(ipns.getLocalKey(peerId.toBytes()), data)

      log(`ipns record for ${uint8ArrayToString(value, 'base32')} was stored in the datastore`)

      return data
    } catch (/** @type {any} */ err) {
      const errMsg = `ipns record for ${value} could not be stored in the datastore`
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_STORING_IN_DATASTORE')
    }
  }
}

IpnsPublisher.defaultRecordLifetime = defaultRecordLifetime
