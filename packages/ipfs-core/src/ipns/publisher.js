'use strict'

const PeerId = require('peer-id')
const { Key, Errors } = require('interface-datastore')
const errcode = require('err-code')
const debug = require('debug')
const log = Object.assign(debug('ipfs:ipns:publisher'), {
  error: debug('ipfs:ipns:publisher:error')
})
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayEquals = require('uint8arrays/equals')

const ipns = require('ipns')

/**
 * @typedef {import('libp2p-crypto').PrivateKey} PrivateKey
 * @typedef {import('libp2p-crypto').PublicKey} PublicKey
 * @typedef {import('ipns').IPNSEntry} IPNSEntry
 */

const ERR_NOT_FOUND = Errors.notFoundError().code
const defaultRecordLifetime = 60 * 60 * 1000

// IpnsPublisher is capable of publishing and resolving names to the IPFS routing system.
class IpnsPublisher {
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
   * @param {PrivateKey} privKey
   * @param {Uint8Array} value
   * @param {number} lifetime
   */
  async publishWithEOL (privKey, value, lifetime) {
    if (!privKey || !privKey.bytes) {
      throw errcode(new Error('invalid private key'), 'ERR_INVALID_PRIVATE_KEY')
    }

    const peerId = await PeerId.createFromPrivKey(privKey.bytes)
    const record = await this._updateOrCreateRecord(privKey, value, lifetime, peerId)

    return this._putRecordToRouting(record, peerId)
  }

  /**
   * Accepts a keypair, as well as a value (ipfsPath), and publishes it out to the routing system
   *
   * @param {PrivateKey} privKey
   * @param {Uint8Array} value
   */
  publish (privKey, value) {
    return this.publishWithEOL(privKey, value, defaultRecordLifetime)
  }

  /**
   * @param {IPNSEntry} record
   * @param {PeerId} peerId
   */
  async _putRecordToRouting (record, peerId) {
    if (!(PeerId.isPeerId(peerId))) {
      const errMsg = 'peerId received is not valid'
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID')
    }

    // @ts-ignore - accessing private property isn't allowed
    const publicKey = peerId._pubKey
    const embedPublicKeyRecord = await ipns.embedPublicKey(publicKey, record)
    const keys = ipns.getIdKeys(peerId.toBytes())

    await this._publishEntry(keys.routingKey, embedPublicKeyRecord || record)

    // Publish the public key to support old go-ipfs nodes that are looking for it in the routing
    // We will be able to deprecate this part in the future, since the public keys will be only
    // in IPNS record and the peerId.
    await this._publishPublicKey(keys.routingPubKey, publicKey)

    return embedPublicKeyRecord || record
  }

  /**
   * @param {Key} key
   * @param {IPNSEntry} entry
   */
  async _publishEntry (key, entry) {
    if (!(Key.isKey(key))) {
      const errMsg = 'datastore key does not have a valid format'

      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_INVALID_DATASTORE_KEY')
    }

    let entryData
    try {
      // Marshal record
      entryData = ipns.marshal(entry)
    } catch (err) {
      log.error(err)

      throw err
    }

    // Add record to routing (buffer key)
    try {
      const res = await this._routing.put(key.uint8Array(), entryData)
      log(`ipns record for ${uint8ArrayToString(key.uint8Array(), 'base64')} was stored in the routing`)

      return res
    } catch (err) {
      const errMsg = `ipns record for ${uint8ArrayToString(key.uint8Array(), 'base64')} could not be stored in the routing`
      log.error(errMsg)
      log.error(err)

      throw errcode(new Error(errMsg), 'ERR_PUTTING_TO_ROUTING')
    }
  }

  /**
   * @param {Key} key
   * @param {PublicKey} publicKey
   */
  async _publishPublicKey (key, publicKey) {
    if ((!Key.isKey(key))) {
      const errMsg = 'datastore key does not have a valid format'
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_INVALID_DATASTORE_KEY')
    }

    if (!publicKey || !publicKey.bytes) {
      const errMsg = 'one or more of the provided parameters are not defined'
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_UNDEFINED_PARAMETER')
    }

    // Add public key to routing (buffer key)
    try {
      const res = await this._routing.put(key.uint8Array(), publicKey.bytes)
      log(`public key for ${uint8ArrayToString(key.uint8Array(), 'base64')} was stored in the routing`)

      return res
    } catch (err) {
      const errMsg = `public key for ${uint8ArrayToString(key.uint8Array(), 'base64')} could not be stored in the routing`
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
    if (!(PeerId.isPeerId(peerId))) {
      const errMsg = 'peerId received is not valid'

      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID')
    }

    const checkRouting = options.checkRouting !== false

    try {
      const dsVal = await this._datastore.get(ipns.getLocalKey(peerId.id))

      // unmarshal data
      return this._unmarshalData(dsVal)
    } catch (err) {
      if (err.code !== ERR_NOT_FOUND) {
        const errMsg = `unexpected error getting the ipns record ${peerId.id} from datastore`
        log.error(errMsg)

        throw errcode(new Error(errMsg), 'ERR_UNEXPECTED_DATASTORE_RESPONSE')
      }

      if (!checkRouting) {
        throw errcode(err, 'ERR_NOT_FOUND_AND_CHECK_ROUTING_NOT_ENABLED')
      }

      // Try to get from routing
      try {
        const keys = ipns.getIdKeys(peerId.toBytes())
        const res = await this._routing.get(keys.routingKey.uint8Array())

        // unmarshal data
        return this._unmarshalData(res)
      } catch (err) {
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
    } catch (err) {
      throw errcode(err, 'ERR_INVALID_RECORD_DATA')
    }
  }

  /**
   * @param {PrivateKey} privKey
   * @param {Uint8Array} value
   * @param {number} lifetime
   * @param {PeerId} peerId
   */
  async _updateOrCreateRecord (privKey, value, lifetime, peerId) {
    if (!(PeerId.isPeerId(peerId))) {
      const errMsg = 'peerId received is not valid'
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID')
    }

    const getPublishedOptions = {
      checkRouting: true
    }

    let record

    try {
      record = await this._getPublished(peerId, getPublishedOptions)
    } catch (err) {
      if (err.code !== ERR_NOT_FOUND) {
        const errMsg = `unexpected error when determining the last published IPNS record for ${peerId.id} ${err.stack}`
        log.error(errMsg)

        throw errcode(new Error(errMsg), 'ERR_DETERMINING_PUBLISHED_RECORD')
      }
    }

    // Determinate the record sequence number
    let seqNumber = 0n

    if (record && record.sequence !== undefined) {
      seqNumber = !uint8ArrayEquals(record.value, value) ? BigInt(record.sequence) + 1n : BigInt(record.sequence)
    }

    let entryData

    try {
      // Create record
      entryData = await ipns.create(privKey, value, seqNumber, lifetime)
    } catch (err) {
      const errMsg = `ipns record for ${value} could not be created`

      log.error(err)
      throw errcode(new Error(errMsg), 'ERR_CREATING_IPNS_RECORD')
    }

    // TODO IMPROVEMENT - set ttl (still experimental feature for go)

    try {
      // Marshal record
      const data = ipns.marshal(entryData)

      // Store the new record
      await this._datastore.put(ipns.getLocalKey(peerId.id), data)

      log(`ipns record for ${uint8ArrayToString(value, 'base32')} was stored in the datastore`)

      return entryData
    } catch (err) {
      const errMsg = `ipns record for ${value} could not be stored in the datastore`
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_STORING_IN_DATASTORE')
    }
  }
}

IpnsPublisher.defaultRecordLifetime = defaultRecordLifetime
exports = module.exports = IpnsPublisher
