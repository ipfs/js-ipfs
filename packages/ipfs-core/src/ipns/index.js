'use strict'

const { createFromPrivKey } = require('peer-id')
const errcode = require('err-code')
const debug = require('debug')
const log = Object.assign(debug('ipfs:ipns'), {
  error: debug('ipfs:ipns:error')
})

const IpnsPublisher = require('./publisher')
const IpnsRepublisher = require('./republisher')
const IpnsResolver = require('./resolver')
const TLRU = require('../utils/tlru')
const defaultRecordTtl = 60 * 1000
const uint8ArrayToString = require('uint8arrays/to-string')

/**
 * @typedef {import('libp2p-crypto').PrivateKey} PrivateKey
 * @typedef {import('peer-id')} PeerId
 */

class IPNS {
  /**
   * @param {import('ipfs-core-types/src/utils').BufferStore} routing
   * @param {import('interface-datastore').Datastore} datastore
   * @param {PeerId} peerId
   * @param {import('libp2p/src/keychain')} keychain
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
   * @param {PrivateKey} privKey
   * @param {Uint8Array} value
   * @param {number} lifetime
   */
  async publish (privKey, value, lifetime = IpnsPublisher.defaultRecordLifetime) {
    try {
      const peerId = await createFromPrivKey(privKey.bytes)
      await this.publisher.publishWithEOL(privKey, value, lifetime)

      log(`IPNS value ${uint8ArrayToString(value, 'base32')} was published correctly`)

      // // Add to cache
      const id = peerId.toB58String()
      // @ts-ignore - parseFloat expects string
      const ttEol = parseFloat(lifetime)
      const ttl = (ttEol < defaultRecordTtl) ? ttEol : defaultRecordTtl

      this.cache.set(id, value, ttl)

      log(`IPNS value ${uint8ArrayToString(value, 'base32')} was cached correctly`)

      return {
        name: id,
        value: value
      }
    } catch (err) {
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
    } catch (err) {
      log.error(err)

      throw err
    }
  }

  /**
   * Initialize keyspace
   *
   * Sets the ipns record for the given key to point to an empty directory
   *
   * @param {PrivateKey} privKey
   * @param {Uint8Array} value
   */
  async initializeKeyspace (privKey, value) { // eslint-disable-line require-await
    return this.publish(privKey, value, IpnsPublisher.defaultRecordLifetime)
  }
}

module.exports = IPNS
