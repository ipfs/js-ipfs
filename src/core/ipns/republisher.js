'use strict'

const ipns = require('ipns')
const crypto = require('libp2p-crypto')
const peerId = require('peer-id')

const debug = require('debug')
const each = require('async/each')
const waterfall = require('async/waterfall')
const log = debug('jsipfs:ipns:republisher')
log.error = debug('jsipfs:ipns:republisher:error')

const minute = 60 * 1000
const hour = 60 * minute

const defaultBroadcastInterval = 4 * hour
const defaultRecordLifetime = 24 * hour

const ERR_NO_ENTRY_FOUND = 'ERR_NO_ENTRY_FOUND'
const ERR_INVALID_IPNS_RECORD = 'ERR_INVALID_IPNS_RECORD'

class IpnsRepublisher {
  constructor (publisher, ipfs) {
    this.publisher = publisher
    this.ipfs = ipfs
    this.repo = ipfs._repo
  }

  start () {
    setInterval(() => {
      this.republishEntries(this.ipfs._peerInfo.id.privKey, this.ipfs._options.pass)
    }, defaultBroadcastInterval)
  }

  republishEntries (privateKey, pass) {
    // TODO: Should use list of published entries.
    // We can't currently *do* that because go uses this method for now.
    this.republishEntry(privateKey, (err) => {
      if (err) {
        const error = 'cannot republish entry for the node\'s private key'

        log.error(error)
        return
      }

      if (this.ipfs._keychain && Boolean(pass)) {
        this.ipfs._keychain.listKeys((err, list) => {
          if (err) {
            const error = 'cannot get the list of available keys in the keychain'

            log.error(error)
            return
          }

          each(list, (key, cb) => {
            waterfall([
              (cb) => this.ipfs._keychain.exportKey(key.name, pass, cb),
              (pem, cb) => crypto.keys.import(pem, pass, cb)
            ], (err, privKey) => {
              if (err) {
                return
              }

              this.republishEntry(privKey, cb)
            })
          }, (err) => {
            if (err) {
              console.log('err', err)
              const error = 'cannot republish entry from the keychain'

              log.error(error)
            }
          })
        })
      }
    })
  }

  republishEntry (privateKey, callback) {
    waterfall([
      (cb) => peerId.createFromPrivKey(privateKey.bytes.toString('base64'), cb),
      (peerIdResult, cb) => this.getLastValue(peerIdResult, cb)
    ], (err, value) => {
      if (err) {
        return callback(err.code === ERR_NO_ENTRY_FOUND ? null : err)
      }

      this.publisher.publishWithEOL(privateKey, value, defaultRecordLifetime, callback)
    })
  }

  getLastValue (id, callback) {
    this.repo.datastore.get(ipns.getLocalKey(id.id), (err, dsVal) => {
      // error handling
      // no need for republish
      if (err && err.notFound) {
        const error = `no previous entry for record with id: ${id}`

        log.error(error)
        return callback(Object.assign(new Error(error), { code: ERR_NO_ENTRY_FOUND }))
      } else if (err) {
        return callback(err)
      }

      if (!Buffer.isBuffer(dsVal)) {
        const error = `found ipns record that we couldn't convert to a value`

        log.error(error)
        return callback(Object.assign(new Error(error), { code: ERR_INVALID_IPNS_RECORD }))
      }

      // unmarshal data
      let record
      try {
        record = ipns.unmarshal(dsVal)
      } catch (err) {
        const error = `found ipns record that we couldn't convert to a value`

        log.error(error)
        return callback(error)
      }

      callback(null, record.value)
    })
  }
}

exports = module.exports = IpnsRepublisher
