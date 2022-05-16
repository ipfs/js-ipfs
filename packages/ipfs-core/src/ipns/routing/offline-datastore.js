import { Key } from 'interface-datastore/key'
import { Libp2pRecord } from '@libp2p/record'
import errcode from 'err-code'
import { logger } from '@libp2p/logger'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const log = logger('ipfs:ipns:offline-datastore')

// Offline datastore aims to mimic the same encoding as routing when storing records
// to the local datastore
export class OfflineDatastore {
  /**
   * @param {import('interface-datastore').Datastore} datastore
   */
  constructor (datastore) {
    this._datastore = datastore
    /** @type {any[]} */
    this.stores = []
  }

  /**
   * Put a value to the local datastore indexed by the received key properly encoded.
   *
   * @param {Uint8Array} key - identifier of the value.
   * @param {Uint8Array} value - value to be stored.
   */
  async put (key, value) { // eslint-disable-line require-await
    if (!(key instanceof Uint8Array)) {
      throw errcode(new Error('Offline datastore key must be a Uint8Array'), 'ERR_INVALID_KEY')
    }

    if (!(value instanceof Uint8Array)) {
      throw errcode(new Error('Offline datastore value must be a Uint8Array'), 'ERR_INVALID_VALUE')
    }

    let routingKey

    try {
      routingKey = this._routingKey(key)
    } catch (/** @type {any} */ err) {
      log.error(err)
      throw errcode(new Error('Not possible to generate the routing key'), 'ERR_GENERATING_ROUTING_KEY')
    }

    // Marshal to libp2p record as the DHT does
    const record = new Libp2pRecord(key, value, new Date())

    await this._datastore.put(routingKey, record.serialize())
  }

  /**
   * Get a value from the local datastore indexed by the received key properly encoded.
   *
   * @param {Uint8Array} key - identifier of the value to be obtained.
   */
  async get (key) {
    if (!(key instanceof Uint8Array)) {
      throw errcode(new Error('Offline datastore key must be a Uint8Array'), 'ERR_INVALID_KEY')
    }

    let routingKey

    try {
      routingKey = this._routingKey(key)
    } catch (/** @type {any} */ err) {
      log.error(err)
      throw errcode(new Error('Not possible to generate the routing key'), 'ERR_GENERATING_ROUTING_KEY')
    }

    const res = await this._datastore.get(routingKey)

    // Unmarshal libp2p record as the DHT does
    let record
    try {
      record = Libp2pRecord.deserialize(res)
    } catch (/** @type {any} */ err) {
      log.error(err)
      throw err
    }

    return record.value
  }

  /**
   * encode key properly - base32(/ipns/{cid})
   *
   * @param {Uint8Array} key
   */
  _routingKey (key) {
    return new Key('/dht/record/' + uint8ArrayToString(key, 'base32'), false)
  }
}
