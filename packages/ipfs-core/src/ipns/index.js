import errcode from 'err-code'
import { logger } from '@libp2p/logger'
import { IpnsPublisher } from './publisher.js'
import { IpnsRepublisher } from './republisher.js'
import { IpnsResolver } from './resolver.js'
import { TLRU } from '../utils/tlru.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const log = logger('ipfs:ipns')
const defaultRecordTtl = 60 * 1000

/**
 * @typedef {import('@libp2p/interfaces/keys').PrivateKey} PrivateKey
 * @typedef {import('@libp2p/interfaces/peer-id').PeerId} PeerId
 */

export class IPNS {
  /**
   * @param {import('ipfs-core-types/src/utils').BufferStore} routing
   * @param {import('interface-datastore').Datastore} datastore
   * @param {PeerId} peerId
   * @param {import('@libp2p/interfaces/keychain').KeyChain} keychain
   * @param {object} options
   * @param {string} options.pass
   * @param {number} [options.initialBroadcastInterval]
   * @param {number} [options.broadcastInterval]
   */
  constructor (routing, datastore, peerId, keychain, options) {
    this.publisher = new IpnsPublisher(routing, datastore)
    this.republisher = new IpnsRepublisher(this.publisher, datastore, peerId, keychain, options)
    this.resolver = new IpnsResolver(routing)
    this.cache = new TLRU(1000)
    this.routing = routing
  }

  /**
   * Publish
   *
   * @param {PeerId} peerId
   * @param {Uint8Array} value
   * @param {number} lifetime
   */
  async publish (peerId, value, lifetime = IpnsPublisher.defaultRecordLifetime) {
    try {
      await this.publisher.publishWithEOL(peerId, value, lifetime)

      log(`IPNS value ${uint8ArrayToString(value, 'base32')} was published correctly`)

      // // Add to cache
      const id = peerId.toString()
      // @ts-expect-error - parseFloat expects string
      const ttEol = parseFloat(lifetime)
      const ttl = (ttEol < defaultRecordTtl) ? ttEol : defaultRecordTtl

      this.cache.set(id, value, ttl)

      log(`IPNS value ${uint8ArrayToString(value, 'base32')} was cached correctly`)

      return {
        name: id,
        value: value
      }
    } catch (/** @type {any} */ err) {
      log.error(err)

      throw err
    }
  }

  /**
   * Resolve
   *
   * @param {string} name
   * @param {object} options
   * @param {boolean} [options.nocache]
   * @param {boolean} [options.recursive]
   */
  async resolve (name, options = {}) {
    if (typeof name !== 'string') {
      throw errcode(new Error('name received is not valid'), 'ERR_INVALID_NAME')
    }

    // If recursive, we should not try to get the cached value
    if (!options.nocache && !options.recursive) {
      // Try to get the record from cache
      const id = name.split('/')[2]
      const result = this.cache.get(id)

      if (result) {
        return result
      }
    }

    try {
      const result = await this.resolver.resolve(name, options)

      log(`IPNS record from ${name} was resolved correctly`)

      return result
    } catch (/** @type {any} */ err) {
      log.error(err)

      throw err
    }
  }

  /**
   * Initialize keyspace
   *
   * Sets the ipns record for the given key to point to an empty directory
   *
   * @param {PeerId} peerId
   * @param {Uint8Array} value
   */
  async initializeKeyspace (peerId, value) { // eslint-disable-line require-await
    return this.publish(peerId, value, IpnsPublisher.defaultRecordLifetime)
  }
}
