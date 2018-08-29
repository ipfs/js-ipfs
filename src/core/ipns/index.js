'use strict'

const { createFromPrivKey } = require('peer-id')
const series = require('async/series')
const Receptacle = require('receptacle')

const debug = require('debug')
const log = debug('jsipfs:ipns')
log.error = debug('jsipfs:ipns:error')

const IpnsPublisher = require('./publisher')
const IpnsRepublisher = require('./republisher')
const IpnsResolver = require('./resolver')
const path = require('./path')

const defaultRecordTtl = 60 * 1000

class IPNS {
  constructor (routing, ipfs) {
    this.publisher = new IpnsPublisher(routing, ipfs._repo)
    this.republisher = new IpnsRepublisher(this.publisher, ipfs)
    this.resolver = new IpnsResolver(routing, ipfs._repo)
    this.cache = new Receptacle({ max: 1000 }) // Create an LRU cache with max 1000 items
  }

  // Publish
  publish (privKey, value, lifetime, callback) {
    series([
      (cb) => createFromPrivKey(privKey.bytes, cb),
      (cb) => this.publisher.publishWithEOL(privKey, value, lifetime, cb)
    ], (err, results) => {
      if (err) {
        log.error(err)
        return callback(err)
      }

      log(`IPNS value ${value} was published correctly`)

      // Add to cache
      const id = results[0].toB58String()
      const ttEol = parseFloat(lifetime)
      const ttl = (ttEol < defaultRecordTtl) ? ttEol : defaultRecordTtl

      this.cache.set(id, value, { ttl: ttl })

      log(`IPNS value ${value} was cached correctly`)

      callback(null, {
        name: id,
        value: value
      })
    })
  }

  // Resolve
  resolve (name, peerId, options, callback) {
    // If recursive, we should not try to get the cached value
    if (!options.nocache && !options.recursive) {
      // Try to get the record from cache
      const id = name.split('/')[2]
      const result = this.cache.get(id)

      if (result) {
        return callback(null, {
          path: result
        })
      }
    }

    this.resolver.resolve(name, peerId, options, (err, result) => {
      if (err) {
        log.error(err)
        return callback(err)
      }

      log(`IPNS record from ${name} was resolved correctly`)

      callback(null, {
        path: result
      })
    })
  }

  // Initialize keyspace
  // sets the ipns record for the given key to point to an empty directory
  initializeKeyspace (privKey, value, callback) {
    this.publisher.publish(privKey, value, callback)
  }
}

exports = module.exports = IPNS
exports.path = path
