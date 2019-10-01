'use strict'

const { createFromPrivKey } = require('peer-id')
const promisify = require('promisify-es6')

const errcode = require('err-code')
const debug = require('debug')
const log = debug('ipfs:ipns')
log.error = debug('ipfs:ipns:error')

const IpnsPublisher = require('./publisher')
const IpnsRepublisher = require('./republisher')
const IpnsResolver = require('./resolver')
const path = require('./path')
const { normalizePath } = require('../utils')
const TLRU = require('../../utils/tlru')
const defaultRecordTtl = 60 * 1000

class IPNS {
  constructor (routing, datastore, peerInfo, keychain, options) {
    this.publisher = new IpnsPublisher(routing, datastore)
    this.republisher = new IpnsRepublisher(this.publisher, datastore, peerInfo, keychain, options)
    this.resolver = new IpnsResolver(routing)
    this.cache = new TLRU(1000)
    this.routing = routing
  }

  // Publish
  async publish (privKey, value, lifetime = IpnsPublisher.defaultRecordLifetime) {
    try {
      value = normalizePath(value)

      const peerId = await promisify(createFromPrivKey)(privKey.bytes)
      await this.publisher.publishWithEOL(privKey, value, lifetime)

      log(`IPNS value ${value} was published correctly`)

      // // Add to cache
      const id = peerId.toB58String()
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
  async resolve (name, options) {
    if (typeof name !== 'string') {
      throw errcode(new Error('name received is not valid'), 'ERR_INVALID_NAME')
    }

    options = options || {}

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

IPNS.path = path

module.exports = IPNS
