'use strict'

const { createFromPrivKey } = require('peer-id')
const series = require('async/series')
// const QuickLRU = require('quick-lru');
// Consider using https://github.com/dominictarr/hashlru

const IpnsPublisher = require('./publisher')
const IpnsResolver = require('./resolver')
const path = require('./path')

// const defaultRecordTtl = 60 * 1000

class IPNS {
  constructor (routing, repo, peerInfo) {
    this.ipnsPublisher = new IpnsPublisher(routing, repo)
    this.ipnsResolver = new IpnsResolver(repo)
    // this.cache = new QuickLRU({maxSize: 1000});
  }

  // Resolve
  resolve (name, pubKey, options, callback) {
    this.ipnsResolver.resolve(name, pubKey, options, (err, result) => {
      if (err) {
        return callback(err)
      }

      return callback(null, result)
    })
  }

  // Publish
  publish (privKey, value, eol, callback) {
    series([
      (cb) => createFromPrivKey(privKey.bytes.toString('base64'), cb),
      (cb) => this.ipnsPublisher.publishWithEOL(privKey, value, eol, cb)
    ], (err, results) => {
      if (err) {
        return callback(err)
      }

      // TODO IMPROVEMENT - Add to cache
      // this.cache.set(id.toB58String(), {
      //   val: value,
      //   eol: Date.now() + ttl
      // })

      callback(null, results[0].toB58String())
    })
  }
}

exports = module.exports = IPNS
exports.path = path
