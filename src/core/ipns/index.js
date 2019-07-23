'use strict'

const { createFromPrivKey } = require('peer-id')
const series = require('async/series')

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
  publish (privKey, value, lifetime = IpnsPublisher.defaultRecordLifetime, callback) {
    try {
      value = normalizePath(value)
    } catch (err) {
      log.error(err)
      return callback(err)
    }

    series([
      (cb) => createFromPrivKey(privKey.bytes, cb),
      (cb) => this.publisher.publishWithEOL(privKey, value, lifetime, cb)
    ], (err, results) => {
      if (err) {
        log.error(err)
        return callback(err)
      }

      log(`IPNS value ${value} was published correctly`)

      // // Add to cache
      const id = results[0].toB58String()
      const ttEol = parseFloat(lifetime)
      const ttl = (ttEol < defaultRecordTtl) ? ttEol : defaultRecordTtl

      this.cache.set(id, value, ttl)

      log(`IPNS value ${value} was cached correctly`)

      callback(null, {
        name: id,
        value: value
      })
    })
  }

  // Resolve
  resolve (name, options, callback) {
    if (typeof name !== 'string') {
      return callback(errcode(new Error('name received is not valid'), 'ERR_INVALID_NAME'))
    }

    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = options || {}

    // If recursive, we should not try to get the cached value
    if (!options.nocache && !options.recursive) {
      // Try to get the record from cache
      const id = name.split('/')[2]
      const result = this.cache.get(id)

      if (result) {
        return callback(null, result)
      }
    }

    this.resolver.resolve(name, options, (err, result) => {
      if (err) {
        log.error(err)
        return callback(err)
      }

      log(`IPNS record from ${name} was resolved correctly`)

      callback(null, result)
    })
  }

  // Initialize keyspace
  // sets the ipns record for the given key to point to an empty directory
  initializeKeyspace (privKey, value, callback) {
    this.publish(privKey, value, IpnsPublisher.defaultRecordLifetime, callback)
  }
}

IPNS.path = path

module.exports = IPNS
