'use strict'

const PeerId = require('peer-id')
const Record = require('libp2p-record').Record
const { Key } = require('interface-datastore')
const series = require('async/series')
const errcode = require('err-code')

const debug = require('debug')
const log = debug('jsipfs:ipns:publisher')
log.error = debug('jsipfs:ipns:publisher:error')

const ipns = require('ipns')

const defaultRecordTtl = 60 * 60 * 1000

// IpnsPublisher is capable of publishing and resolving names to the IPFS routing system.
class IpnsPublisher {
  constructor (routing, repo) {
    this._routing = routing
    this._repo = repo
  }

  // publish record with a eol
  publishWithEOL (privKey, value, lifetime, callback) {
    if (!privKey || !privKey.bytes) {
      const errMsg = `one or more of the provided parameters are not defined`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_UNDEFINED_PARAMETER'))
    }

    PeerId.createFromPrivKey(privKey.bytes, (err, peerId) => {
      if (err) {
        callback(err)
      }

      this._updateOrCreateRecord(privKey, value, lifetime, peerId, (err, record) => {
        if (err) {
          return callback(err)
        }

        this._putRecordToRouting(record, peerId, callback)
      })
    })
  }

  // Accepts a keypair, as well as a value (ipfsPath), and publishes it out to the routing system
  publish (privKey, value, callback) {
    this.publishWithEOL(privKey, value, defaultRecordTtl, callback)
  }

  _putRecordToRouting (record, peerId, callback) {
    if (!(PeerId.isPeerId(peerId))) {
      const errMsg = `peerId received is not valid`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID'))
    }

    const publicKey = peerId._pubKey

    ipns.embedPublicKey(publicKey, record, (err, embedPublicKeyRecord) => {
      if (err) {
        return callback(err)
      }

      let keys
      try {
        keys = ipns.getIdKeys(peerId.id)
      } catch (err) {
        log.error(err)
        return callback(err)
      }

      series([
        (cb) => this._publishEntry(keys.ipnsKey, embedPublicKeyRecord || record, peerId, cb),
        // Publish the public key if a public key cannot be extracted from the ID
        // We will be able to deprecate this part in the future, since the public keys will be only in the peerId
        (cb) => embedPublicKeyRecord ? this._publishPublicKey(keys.pkKey, publicKey, peerId, cb) : cb()
      ], (err) => {
        if (err) {
          log.error(err)
          return callback(err)
        }

        callback(null, embedPublicKeyRecord || record)
      })
    })
  }

  _publishEntry (key, entry, peerId, callback) {
    if (!(Key.isKey(key))) {
      const errMsg = `datastore key does not have a valid format`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_DATASTORE_KEY'))
    }

    let rec
    try {
      // Marshal record
      const entryData = ipns.marshal(entry)
      // Marshal to libp2p record
      rec = new Record(key.toBuffer(), entryData)
    } catch (err) {
      log.error(err)
      return callback(err)
    }

    // TODO Routing - this should be replaced by a put to the DHT
    this._repo.datastore.put(key, rec.serialize(), (err, res) => {
      if (err) {
        const errMsg = `ipns record for ${key.toString()} could not be stored in the routing`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_STORING_IN_DATASTORE'))
      }

      log(`ipns record for ${key.toString()} was stored in the routing`)
      callback(null, res)
    })
  }

  _publishPublicKey (key, publicKey, peerId, callback) {
    if ((!Key.isKey(key))) {
      const errMsg = `datastore key does not have a valid format`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_DATASTORE_KEY'))
    }

    if (!publicKey || !publicKey.bytes) {
      const errMsg = `one or more of the provided parameters are not defined`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_UNDEFINED_PARAMETER'))
    }

    let rec
    try {
      // Marshal to libp2p record
      rec = new Record(key.toBuffer(), publicKey.bytes)
    } catch (err) {
      log.error(err)
      return callback(err)
    }

    // TODO Routing - this should be replaced by a put to the DHT
    this._repo.datastore.put(key, rec.serialize(), (err, res) => {
      if (err) {
        const errMsg = `public key for ${key.toString()} could not be stored in the routing`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_STORING_IN_DATASTORE'))
      }

      log(`public key for ${key.toString()} was stored in the routing`)
      callback(null, res)
    })
  }

  // Returns the record this node has published corresponding to the given peer ID.
  // If `checkRouting` is true and we have no existing record, this method will check the routing system for any existing records.
  _getPublished (peerId, options, callback) {
    if (!(PeerId.isPeerId(peerId))) {
      const errMsg = `peerId received is not valid`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID'))
    }

    options = options || {}
    const checkRouting = !(options.checkRouting === false)

    this._repo.datastore.get(ipns.getLocalKey(peerId.id), (err, dsVal) => {
      let result

      if (err) {
        if (err.code !== 'ERR_NOT_FOUND') {
          const errMsg = `unexpected error getting the ipns record ${peerId.id} from datastore`

          log.error(errMsg)
          return callback(errcode(new Error(errMsg), 'ERR_UNEXPECTED_DATASTORE_RESPONSE'))
        } else {
          if (!checkRouting) {
            return callback(null, null)
          } else {
            // TODO ROUTING - get from DHT
            return callback(new Error('not implemented yet'))
          }
        }
      }

      if (Buffer.isBuffer(dsVal)) {
        result = dsVal
      } else {
        const errMsg = `found ipns record that we couldn't convert to a value`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_INVALID_IPNS_RECORD'))
      }

      // unmarshal data
      try {
        result = ipns.unmarshal(dsVal)
      } catch (err) {
        const errMsg = `found ipns record that we couldn't convert to a value`

        log.error(errMsg)
        return callback(null, null)
      }

      callback(null, result)
    })
  }

  _updateOrCreateRecord (privKey, value, validity, peerId, callback) {
    if (!(PeerId.isPeerId(peerId))) {
      const errMsg = `peerId received is not valid`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID'))
    }

    const getPublishedOptions = {
      checkRouting: false // TODO ROUTING - change to true
    }

    this._getPublished(peerId, getPublishedOptions, (err, record) => {
      if (err) {
        return callback(err)
      }

      // Determinate the record sequence number
      let seqNumber = 0
      if (record && record.sequence !== undefined) {
        seqNumber = record.value.toString() !== value ? record.sequence + 1 : record.sequence
      }

      // Create record
      ipns.create(privKey, value, seqNumber, validity, (err, entryData) => {
        if (err) {
          const errMsg = `ipns record for ${value} could not be created`

          log.error(errMsg)
          return callback(errcode(new Error(errMsg), 'ERR_CREATING_IPNS_RECORD'))
        }

        // TODO IMPROVEMENT - set ttl (still experimental feature for go)

        // Marshal record
        const data = ipns.marshal(entryData)

        // Store the new record
        this._repo.datastore.put(ipns.getLocalKey(peerId.id), data, (err, res) => {
          if (err) {
            const errMsg = `ipns record for ${value} could not be stored in the datastore`

            log.error(errMsg)
            return callback(errcode(new Error(errMsg), 'ERR_STORING_IN_DATASTORE'))
          }

          log(`ipns record for ${value} was stored in the datastore`)
          callback(null, entryData)
        })
      })
    })
  }
}

exports = module.exports = IpnsPublisher
