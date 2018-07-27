'use strict'

const peerId = require('peer-id')
const series = require('async/series')

const debug = require('debug')
const log = debug('jsipfs:ipns:publisher')
log.error = debug('jsipfs:ipns:publisher:error')

const ipns = require('ipns')

const ERR_CREATING_IPNS_RECORD = 'ERR_CREATING_IPNS_RECORD'
const ERR_INVALID_IPNS_RECORD = 'ERR_INVALID_IPNS_RECORD'
const ERR_STORING_IN_DATASTORE = 'ERR_STORING_IN_DATASTORE'
const ERR_UNEXPECTED_DATASTORE_RESPONSE = 'ERR_UNEXPECTED_DATASTORE_RESPONSE'

const defaultRecordTtl = 60 * 60 * 1000

// IpnsPublisher is capable of publishing and resolving names to the IPFS routing system.
class IpnsPublisher {
  constructor (routing, repo) {
    this.routing = routing
    this.repo = repo
  }

  // publish record with a eol
  publishWithEOL (privKey, value, lifetime, callback) {
    peerId.createFromPrivKey(privKey.bytes.toString('base64'), (err, peerIdResult) => {
      if (err) {
        callback(err)
      }

      this.updateOrCreateRecord(privKey, value, lifetime, peerIdResult, (err, record) => {
        if (err) {
          return callback(err)
        }

        this.putRecordToRouting(record, peerIdResult, callback)
      })
    })
  }

  // Accepts a keypair, as well as a value (ipfsPath), and publishes it out to the routing system
  publish (privKey, value, callback) {
    this.publishWithEOL(privKey, value, defaultRecordTtl, callback)
  }

  putRecordToRouting(record, peerIdResult, callback) {
    const publicKey = peerIdResult._pubKey

    ipns.embedPublicKey(publicKey, record, (err, embedPublicKeyRecord) => {
      if (err) {
        return callback(err)
      }
      
      const { ipnsKey, pkKey } = ipns.getIdKeys(peerIdResult.id)
      
      series([
        (cb) => this.publishEntry(ipnsKey, record, cb),
        // Publish the public key if a public key cannot be extracted from the ID
        // We will be able to deprecate this part in the future, since the public keys will be only in the peerId
        (cb) => embedPublicKeyRecord ? this.publishPublicKey(pkKey, publicKey, cb) : cb(),
      ], (err) => {
        if (err) {
          return callback(err)
        }

        return callback(null, embedPublicKeyRecord || record)
      })
    })
  }

  publishEntry (key, entry, callback) {    
    // Marshal record
    const data = ipns.marshal(entry)
    
    // TODO Routing - this should be replaced by a put to the DHT
    this.repo.datastore.put(key, data, (err, res) => {
      if (err) {
        log.error(`ipns record for ${value} could not be stored in the routing`)
        return callback(Object.assign(new Error(`ipns record for ${value} could not be stored in the routing`), { code: ERR_STORING_IN_DATASTORE }))
      }

      log(`ipns record for ${key.toString()} was stored in the routing`)
      return callback(null, res)
    })
  }

  publishPublicKey (key, publicKey, callback) {
    console.log('publish public key');
    
    // TODO Routing - this should be replaced by a put to the DHT
    this.repo.datastore.put(key, publicKey.bytes, (err, res) => {
      if (err) {
        log.error(`public key for ${value} could not be stored in the routing`)
        return callback(Object.assign(new Error(`public key for ${value} could not be stored in the routing`), { code: ERR_STORING_IN_DATASTORE }))
      }

      log(`public key for ${key.toString()} was stored in the routing`)
      return callback(null, res)
    })
  }

  // Returns the record this node has published corresponding to the given peer ID.
  // If `checkRouting` is true and we have no existing record, this method will check the routing system for any existing records.
  getPublished (peerIdResult, checkRouting, callback) {
    this.repo.datastore.get(ipns.getLocalKey(peerIdResult.id), (err, dsVal) => {
      let result

      if (!err) {
        if (Buffer.isBuffer(dsVal)) {
          result = dsVal
        } else {
          const error = `found ipns record that we couldn't convert to a value`

          log.error(error)
          return callback(Object.assign(new Error(error), { code: ERR_INVALID_IPNS_RECORD }))
        }
      } else if (err.notFound) {
        if (!checkRouting) {
          return callback(null, null)
        }
        // TODO ROUTING - get
      } else {
        const error = `unexpected error getting the ipns record ${peerIdResult.id} from datastore`

        log.error(error)
        return callback(Object.assign(new Error(error), { code: ERR_UNEXPECTED_DATASTORE_RESPONSE }))
      }

      // unmarshal data
      try {
        result = ipns.unmarshal(dsVal)
      } catch (err) {
        const error = `found ipns record that we couldn't convert to a value`

        log.error(error)
        return callback(null, null)
      }

      return callback(null, result)
    })
  }

  updateOrCreateRecord(privKey, value, validity, peerIdResult, callback) {
    this.getPublished(peerIdResult, false, (err, record) => { // TODO ROUTING - change to true
      if (err) {
        callback(err)
      }

      // Determinate the record sequence number
      let seqNumber = 0
      if (record && record.sequence !== undefined) {
        seqNumber = record.value.toString() !== value ? record.sequence + 1 : record.sequence
      }

      // Create record
      ipns.create(privKey, value, seqNumber, validity, (err, entryData) => {
        if (err) {
          const error = `ipns record for ${value} could not be created`

          log.error(error)
          return callback(Object.assign(new Error(error), { code: ERR_CREATING_IPNS_RECORD }))
        }

        // TODO IMPROVEMENT - set ttl (still experimental feature for go)

        // Marshal record
        const data = ipns.marshal(entryData)

        // Store the new record
        this.repo.datastore.put(ipns.getLocalKey(peerIdResult.id), data, (err, res) => {
          if (err) {
            log.error(`ipns record for ${value} could not be stored in the datastore`)
            return callback(Object.assign(new Error(`ipns record for ${value} could not be stored in the datastore`), { code: ERR_STORING_IN_DATASTORE }))
          }

          log(`ipns record for ${value} was stored in the datastore`)
          return callback(null, entryData)
        })
      })
    })
  }
}

exports = module.exports = IpnsPublisher
