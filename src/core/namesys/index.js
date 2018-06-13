'use strict'

const peerId = require('peer-id')
const series = require('async/series')
// const QuickLRU = require('quick-lru');

const IpnsPublisher = require('./publisher')
const IpnsResolver = require('./resolver')

// const defaultRecordTtl = 60 * 1000

class Namesys {
  constructor (routing, repo, peerInfo) {
    this.ipnsPublisher = new IpnsPublisher(routing, repo)
    this.ipnsResolver = new IpnsResolver(repo)
    // this.cache = new QuickLRU({maxSize: 1000});
  }

  // Resolve
  resolve (name, pubKey, callback) {
    // this.ipnsResolver.resolve()

    this.ipnsResolver.resolve(name, pubKey, (err, result) => {
      if (err) {
        return callback(err)
      }

      return callback(null, result)
    })
  }

  // publish (value = ipfsPath)
  publish (privKey, value) {
    // TODO https://github.com/ipfs/go-ipfs/blob/master/namesys/namesys.go#L111
  }

  // publish with EOL (value = ipfsPath)
  publishWithEOL (privKey, value, eol, callback) {
    series([
      (cb) => peerId.createFromPrivKey(privKey.bytes.toString('base64'), cb),
      (cb) => this.ipnsPublisher.publishWithEOL(privKey, value, eol, cb)
    ], (err, results) => {
      if (err) {
        return callback(err)
      }

      // TODO Add to cache
      // this.cache.set(id.toB58String(), {
      //   val: value,
      //   eol: Date.now() + ttl
      // })

      callback(null, results[0].toB58String())
    })
  }
}

exports = module.exports = Namesys
