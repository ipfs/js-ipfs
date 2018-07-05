'use strict'

const peerId = require('peer-id')
const waterfall = require('async/waterfall')

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
    this.updateOrCreateRecord(privKey, value, lifetime, (err, record) => {
      if (err) {
        return callback(err)
      }

      // TODO ROUTING - Add record (with public key)

      callback(null, record)
    })
  }

  // Accepts a keypair, as well as a value (ipfsPath), and publishes it out to the routing system
  publish (privKey, value, callback) {
    this.publishWithEOL(privKey, value, defaultRecordTtl, callback)
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
          return callback(null, {
            peerIdResult: peerIdResult
          })
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
        return callback(null, {
          peerIdResult: peerIdResult
        })
      }

      return callback(null, {
        peerIdResult: peerIdResult,
        record: result
      })
    })
  }

  updateOrCreateRecord (privKey, value, validity, callback) {
    waterfall([
      (cb) => peerId.createFromPrivKey(privKey.bytes.toString('base64'), cb),
      (id, cb) => this.getPublished(id, false, cb) // TODO ROUTING - change to true
    ], (err, result) => {
      if (err) {
        callback(err)
      }

      const { peerIdResult, record } = result

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
