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
const { normalizePath } = require('../utils')
const TLRU = require('../utils/tlru')
const defaultRecordTtl = 60 * 1000

class IPNS {
  constructor (routing, datastore, peerId, keychain, options) {
    this.publisher = new IpnsPublisher(routing, datastore)
    this.republisher = new IpnsRepublisher(this.publisher, datastore, peerId, keychain, options)
    this.resolver = new IpnsResolver(routing)
    this.cache = new TLRU(1000)
    this.routing = routing
  }

  // Publish
  async publish (privKey, value, lifetime = IpnsPublisher.defaultRecordLifetime) {
    try {
      value = normalizePath(value)

      const peerId = await createFromPrivKey(privKey.bytes)
      await this.publisher.publishWithEOL(privKey, value, lifetime)

      log(`IPNS value ${value} was published correctly`)

      // // Add to cache
      const id = peerId.toB58String()
      // @ts-ignore - parseFloat expects string
      const ttEol = parseFloat(lifetime)
      const ttl = (ttEol < defaultRecordTtl) ? ttEol : defaultRecordTtl

      this.cache.set(id, value, ttl)

      log(`IPNS value ${value} was cached correctly`)

      return {
        name: id,
        value: value
      }
    } catch (err) {
      log.error(err)

      throw err
    }
  }

  // Resolve
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

  // Initialize keyspace
  // sets the ipns record for the given key to point to an empty directory
  async initializeKeyspace (privKey, value) { // eslint-disable-line require-await
    return this.publish(privKey, value, IpnsPublisher.defaultRecordLifetime)
  }
}

module.exports = IPNS
