import drain from 'it-drain'
import { notFoundError } from 'datastore-core/errors'
import { logger } from '@libp2p/logger'

const log = logger('ipfs:ipns:dht-datastore')

export class DHTDatastore {
  /**
   *
   * @param {import('@libp2p/interfaces/dht').DHT} dht
   */
  constructor (dht) {
    this._dht = dht
  }

  /**
   * @param {Uint8Array} key - identifier of the value.
   * @param {Uint8Array} value - value to be stored.
   */
  async put (key, value) {
    try {
      await drain(this._dht.put(key, value))
    } catch (/** @type {any} */ err) {
      log.error(err)
      throw err
    }
  }

  /**
   * @param {Uint8Array} key - identifier of the value to be obtained.
   */
  async get (key) {
    for await (const event of this._dht.get(key)) {
      if (event.name === 'VALUE') {
        return event.value
      }
    }

    throw notFoundError()
  }
}
