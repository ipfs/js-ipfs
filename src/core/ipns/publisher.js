'use strict'

const peerId = require('peer-id')
const waterfall = require('async/waterfall')

const debug = require('debug')
const log = debug('jsipfs:ipns:publisher')
log.error = debug('jsipfs:ipns:publisher:error')

const ERR_INVALID_IPNS_RECORD = 'ERR_INVALID_IPNS_RECORD'
const ERR_STORING_IN_DATASTORE = 'ERR_STORING_IN_DATASTORE'

const ipns = require('ipns')

const defaultRecordTtl = 60 * 60 * 1000

/*
  IpnsPublisher is capable of publishing and resolving names to the IPFS
  routing system.
  */
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

      // TODO ROUTING - Add record

      log(`${value} was published correctly with EOL`)
      callback(null, record)
    })
  }

  // Accepts a keypair, as well as a value (ipfsPath), and publishes it out to the routing system
  publish (privKey, value, callback) {
    this.publishWithEOL(privKey, value, defaultRecordTtl, (err, res) => {
      if (err) {
        return callback(err)
      }

      log(`${value} was published correctly`)
      callback(res)
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
          log.error(`found ipns record that we couldn't convert to a value`)
          return callback(Object.assign(new Error('found ipns record that we couldn\'t convert to a value'), { code: ERR_INVALID_IPNS_RECORD }))
        }
      } else if (err.notFound) {
        if (!checkRouting) {
          return callback(null, {
            peerIdResult: peerIdResult
          })
        }
        // TODO ROUTING
      } else {
        log.error(`unexpected error getting the ipns record from datastore`)
        return callback(err)
      }

      // unmarshal data
      result = ipns.unmarshal(dsVal)

      return callback(null, {
        peerIdResult: peerIdResult,
        record: result
      })
    })
  }

  updateOrCreateRecord (privKey, value, validity, callback) {
    waterfall([
      (cb) => peerId.createFromPrivKey(privKey.bytes.toString('base64'), cb),
      (id, cb) => this.getPublished(id, false, cb)
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
          log.error(`ipns record for ${value} could not be created`)
          return callback(err)
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
