'use strict'

const ipns = require('ipns')
const crypto = require('libp2p-crypto')
const PeerId = require('peer-id')
const errcode = require('err-code')

const debug = require('debug')
const each = require('async/each')
const waterfall = require('async/waterfall')
const log = debug('ipfs:ipns:republisher')
log.error = debug('ipfs:ipns:republisher:error')

const minute = 60 * 1000
const hour = 60 * minute

const defaultBroadcastInterval = 4 * hour
const defaultRecordLifetime = 24 * hour

class IpnsRepublisher {
  constructor (publisher, datastore, peerInfo, keychain, options) {
    this._publisher = publisher
    this._datastore = datastore
    this._peerInfo = peerInfo
    this._keychain = keychain
    this._options = options
    this._republishHandle = null
  }

  start () {
    if (this._republishHandle) {
      throw errcode(new Error('republisher is already running'), 'ERR_REPUBLISH_ALREADY_RUNNING')
    }

    // TODO: this handler should be isolated in another module
    const republishHandle = {
      _onCancel: null,
      _timeoutId: null,
      runPeriodically: (fn, period) => {
        republishHandle._timeoutId = setTimeout(() => {
          republishHandle._timeoutId = null

          fn((nextPeriod) => {
            // Was republish cancelled while fn was being called?
            if (republishHandle._onCancel) {
              return republishHandle._onCancel()
            }
            // Schedule next
            republishHandle.runPeriodically(fn, nextPeriod || period)
          })
        }, period)
      },
      cancel: (cb) => {
        // Not currently running a republish, can callback immediately
        if (republishHandle._timeoutId) {
          clearTimeout(republishHandle._timeoutId)
          return cb()
        }
        // Wait for republish to finish then call callback
        republishHandle._onCancel = cb
      }
    }

    const { privKey } = this._peerInfo.id
    const { pass } = this._options

    republishHandle.runPeriodically((done) => {
      this._republishEntries(privKey, pass, () => done(defaultBroadcastInterval))
    }, minute)

    this._republishHandle = republishHandle
  }

  stop (callback) {
    const republishHandle = this._republishHandle

    if (!republishHandle) {
      return callback(errcode(new Error('republisher is not running'), 'ERR_REPUBLISH_NOT_RUNNING'))
    }

    this._republishHandle = null
    republishHandle.cancel(callback)
  }

  _republishEntries (privateKey, pass, callback) {
    // TODO: Should use list of published entries.
    // We can't currently *do* that because go uses this method for now.
    this._republishEntry(privateKey, (err) => {
      if (err) {
        const errMsg = 'cannot republish entry for the node\'s private key'

        log.error(errMsg)
        return
      }

      // keychain needs pass to get the cryptographic keys
      if (pass) {
        this._keychain.listKeys((err, list) => {
          if (err) {
            log.error(err)
            return
          }

          each(list, (key, cb) => {
            waterfall([
              (cb) => this._keychain.exportKey(key.name, pass, cb),
              (pem, cb) => crypto.keys.import(pem, pass, cb)
            ], (err, privKey) => {
              if (err) {
                log.error(err)
                return
              }

              this._republishEntry(privKey, cb)
            })
          }, (err) => {
            if (err) {
              log.error(err)
            }
            callback(null)
          })
        })
      } else {
        callback(null)
      }
    })
  }

  _republishEntry (privateKey, callback) {
    if (!privateKey || !privateKey.bytes) {
      return callback(errcode(new Error('invalid private key'), 'ERR_INVALID_PRIVATE_KEY'))
    }

    waterfall([
      (cb) => PeerId.createFromPrivKey(privateKey.bytes, cb),
      (peerId, cb) => this._getPreviousValue(peerId, cb)
    ], (err, value) => {
      if (err) {
        return callback(err.code === 'ERR_NO_ENTRY_FOUND' ? null : err)
      }

      this._publisher.publishWithEOL(privateKey, value, defaultRecordLifetime, callback)
    })
  }

  _getPreviousValue (peerId, callback) {
    if (!(PeerId.isPeerId(peerId))) {
      return callback(errcode(new Error('invalid peer ID'), 'ERR_INVALID_PEER_ID'))
    }

    this._datastore.get(ipns.getLocalKey(peerId.id), (err, dsVal) => {
      // error handling
      // no need to republish
      if (err && err.notFound) {
        return callback(errcode(new Error(`no previous entry for record with id: ${peerId.id}`), 'ERR_NO_ENTRY_FOUND'))
      } else if (err) {
        return callback(err)
      }

      if (!Buffer.isBuffer(dsVal)) {
        return callback(errcode(new Error("found ipns record that we couldn't process"), 'ERR_INVALID_IPNS_RECORD'))
      }

      // unmarshal data
      let record
      try {
        record = ipns.unmarshal(dsVal)
      } catch (err) {
        log.error(err)
        return callback(errcode(new Error('found ipns record that we couldn\'t convert to a value'), 'ERR_INVALID_IPNS_RECORD'))
      }

      callback(null, record.value)
    })
  }
}

exports = module.exports = IpnsRepublisher
