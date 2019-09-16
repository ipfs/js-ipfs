'use strict'

const PeerId = require('peer-id')
const { Key } = require('interface-datastore')
const series = require('async/series')
const errcode = require('err-code')

const debug = require('debug')
const log = debug('ipfs:ipns:publisher')
log.error = debug('ipfs:ipns:publisher:error')

const ipns = require('ipns')

const defaultRecordLifetime = 60 * 60 * 1000

// IpnsPublisher is capable of publishing and resolving names to the IPFS routing system.
class IpnsPublisher {
  constructor (routing, datastore) {
    this._routing = routing
    this._datastore = datastore
  }

  // publish record with a eol
  publishWithEOL (privKey, value, lifetime, callback) {
    if (!privKey || !privKey.bytes) {
      return callback(errcode(new Error('invalid private key'), 'ERR_INVALID_PRIVATE_KEY'))
    }

    PeerId.createFromPrivKey(privKey.bytes, (err, peerId) => {
      if (err) {
        return callback(err)
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
    this.publishWithEOL(privKey, value, defaultRecordLifetime, callback)
  }

  _putRecordToRouting (record, peerId, callback) {
    if (!(PeerId.isPeerId(peerId))) {
      const errMsg = 'peerId received is not valid'

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
        keys = ipns.getIdKeys(peerId.toBytes())
      } catch (err) {
        log.error(err)
        return callback(err)
      }

      series([
        (cb) => this._publishEntry(keys.routingKey, embedPublicKeyRecord || record, peerId, cb),
        // Publish the public key to support old go-ipfs nodes that are looking for it in the routing
        // We will be able to deprecate this part in the future, since the public keys will be only
        // in IPNS record and the peerId.
        (cb) => this._publishPublicKey(keys.routingPubKey, publicKey, peerId, cb)
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
      const errMsg = 'datastore key does not have a valid format'

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_DATASTORE_KEY'))
    }

    let entryData
    try {
      // Marshal record
      entryData = ipns.marshal(entry)
    } catch (err) {
      log.error(err)
      return callback(err)
    }

    // Add record to routing (buffer key)
    this._routing.put(key.toBuffer(), entryData, (err, res) => {
      if (err) {
        const errMsg = `ipns record for ${key.toString('base64')} could not be stored in the routing`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_PUTTING_TO_ROUTING'))
      }

      log(`ipns record for ${key.toString('base64')} was stored in the routing`)
      callback(null, res)
    })
  }

  _publishPublicKey (key, publicKey, peerId, callback) {
    if ((!Key.isKey(key))) {
      const errMsg = 'datastore key does not have a valid format'

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_DATASTORE_KEY'))
    }

    if (!publicKey || !publicKey.bytes) {
      const errMsg = 'one or more of the provided parameters are not defined'

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_UNDEFINED_PARAMETER'))
    }

    // Add public key to routing (buffer key)
    this._routing.put(key.toBuffer(), publicKey.bytes, (err, res) => {
      if (err) {
        const errMsg = `public key for ${key.toString('base64')} could not be stored in the routing`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_PUTTING_TO_ROUTING'))
      }

      log(`public key for ${key.toString('base64')} was stored in the routing`)
      callback(null, res)
    })
  }

  // Returns the record this node has published corresponding to the given peer ID.
  // If `checkRouting` is true and we have no existing record, this method will check the routing system for any existing records.
  _getPublished (peerId, options, callback) {
    if (!(PeerId.isPeerId(peerId))) {
      const errMsg = 'peerId received is not valid'

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID'))
    }

    options = options || {}
    const checkRouting = options.checkRouting !== false

    this._datastore.get(ipns.getLocalKey(peerId.id), (err, dsVal) => {
      if (err) {
        if (err.code !== 'ERR_NOT_FOUND') {
          const errMsg = `unexpected error getting the ipns record ${peerId.id} from datastore`

          log.error(errMsg)
          return callback(errcode(new Error(errMsg), 'ERR_UNEXPECTED_DATASTORE_RESPONSE'))
        }

        if (!checkRouting) {
          return callback((errcode(err)))
        }

        // Try to get from routing
        let keys
        try {
          keys = ipns.getIdKeys(peerId.toBytes())
        } catch (err) {
          log.error(err)
          return callback(err)
        }

        this._routing.get(keys.routingKey.toBuffer(), (err, res) => {
          if (err) {
            return callback(err)
          }

          // unmarshal data
          this._unmarshalData(res, callback)
        })
      } else {
        // unmarshal data
        this._unmarshalData(dsVal, callback)
      }
    })
  }

  _unmarshalData (data, callback) {
    let result
    try {
      result = ipns.unmarshal(data)
    } catch (err) {
      log.error(err)
      return callback(errcode(err, 'ERR_INVALID_RECORD_DATA'))
    }

    callback(null, result)
  }

  _updateOrCreateRecord (privKey, value, validity, peerId, callback) {
    if (!(PeerId.isPeerId(peerId))) {
      const errMsg = 'peerId received is not valid'

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_PEER_ID'))
    }

    const getPublishedOptions = {
      checkRouting: true
    }

    this._getPublished(peerId, getPublishedOptions, (err, record) => {
      if (err) {
        if (err.code !== 'ERR_NOT_FOUND') {
          const errMsg = `unexpected error when determining the last published IPNS record for ${peerId.id}`

          log.error(errMsg)
          return callback(errcode(new Error(errMsg), 'ERR_DETERMINING_PUBLISHED_RECORD'))
        }
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
        this._datastore.put(ipns.getLocalKey(peerId.id), data, (err, res) => {
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

IpnsPublisher.defaultRecordLifetime = defaultRecordLifetime
exports = module.exports = IpnsPublisher
