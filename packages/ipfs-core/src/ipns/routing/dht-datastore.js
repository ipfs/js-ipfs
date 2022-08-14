import drain from 'it-drain'
import { notFoundError } from 'datastore-core/errors'
import { logger } from '@libp2p/logger'

const log = logger('ipfs:ipns:dht-datastore')

/**
 * @typedef {import('@libp2p/interfaces').AbortOptions} AbortOptions
 */

export class DHTDatastore {
  /**
   *
   * @param {import('@libp2p/interface-dht').DHT} dht
   */
  constructor (dht) {
    this._dht = dht
  }

  /**
   * @param {Uint8Array} key - identifier of the value.
   * @param {Uint8Array} value - value to be stored.
   * @param {AbortOptions} [options]
   */
  async put (key, value, options) {
    try {
      await drain(this._dht.put(key, value, options))
    } catch (/** @type {any} */ err) {
      log.error(err)
      throw err
    }
  }

  /**
   * @param {Uint8Array} key - identifier of the value to be obtained.
   * @param {AbortOptions} [options]
   */
  async get (key, options) {
    for await (const event of this._dht.get(key, options)) {
      if (event.name === 'VALUE') {
        return event.value
      }
    }

    throw notFoundError()
  }
}
